import { computeShaderCode, renderShaderCode } from './shaders.wgsl.js';

const canvas = document.getElementById('webgpu-canvas');
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();
const context = canvas.getContext('webgpu');

const format = navigator.gpu.getPreferredCanvasFormat();
context.configure({ device, format });

const NUM_PARTICLES = 10000;
const MAX_EDGES = 500000;
const RADIUS = 0.05;

// Create particle buffer
const particleBuffer = device.createBuffer({
  size: NUM_PARTICLES * 8,
  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  mappedAtCreation: true,
});
const particleArray = new Float32Array(particleBuffer.getMappedRange());
for (let i = 0; i < NUM_PARTICLES; i++) {
  particleArray[i * 2 + 0] = Math.random() * 2 - 1;
  particleArray[i * 2 + 1] = Math.random() * 2 - 1;
}
particleBuffer.unmap();

// Edge buffer (pairs of indices)
const edgeBuffer = device.createBuffer({
  size: MAX_EDGES * 8,
  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX,
});

// Edge counter
const edgeCountBuffer = device.createBuffer({
  size: 4,
  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
});

// Compute pipeline
const computeModule = device.createShaderModule({ code: computeShaderCode });
const computePipeline = device.createComputePipeline({
  layout: 'auto',
  compute: { module: computeModule, entryPoint: 'main' },
});
const computeBindGroup = device.createBindGroup({
  layout: computePipeline.getBindGroupLayout(0),
  entries: [
    { binding: 0, resource: { buffer: particleBuffer } },
    { binding: 1, resource: { buffer: edgeBuffer } },
    { binding: 2, resource: { buffer: edgeCountBuffer } },
    { binding: 3, resource: { buffer: device.createBuffer({
      size: 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    }) } },
  ],
});
device.queue.writeBuffer(computeBindGroup.getBinding(3).resource.buffer, 0, new Float32Array([RADIUS]));
// device.queue.writeBuffer(radiusBuffer, 0, new Float32Array([RADIUS]));


// Render pipeline
const renderModule = device.createShaderModule({ code: renderShaderCode });
const renderPipeline = device.createRenderPipeline({
  layout: 'auto',
  vertex: {
    module: renderModule,
    entryPoint: 'vs_main',
    buffers: [{
      arrayStride: 8,
      attributes: [{ shaderLocation: 0, offset: 0, format: 'uint32x2' }],
    }],
  },
  fragment: {
    module: renderModule,
    entryPoint: 'fs_main',
    targets: [{ format }],
  },
  primitive: { topology: 'line-list' },
});

// Render loop
function frame() {
  const encoder = device.createCommandEncoder();

  // Reset edge count
  encoder.clearBuffer(edgeCountBuffer);

  // Compute pass
  const computePass = encoder.beginComputePass();
  computePass.setPipeline(computePipeline);
  computePass.setBindGroup(0, computeBindGroup);
  computePass.dispatchWorkgroups(NUM_PARTICLES);
  computePass.end();

  // Render pass
  const renderPass = encoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      loadOp: 'clear',
      storeOp: 'store',
      clearValue: { r: 0, g: 0, b: 0, a: 1 },
    }],
  });
  renderPass.setPipeline(renderPipeline);
  renderPass.setVertexBuffer(0, edgeBuffer);
  renderPass.setBindGroup(0, device.createBindGroup({
    layout: renderPipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: particleBuffer } }],
  }));
  renderPass.draw(MAX_EDGES * 2);
  renderPass.end();

  device.queue.submit([encoder.finish()]);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
