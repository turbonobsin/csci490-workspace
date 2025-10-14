export const computeShaderCode = `
struct Edge {
  a : u32,
  b : u32,
};

@group(0) @binding(0) var<storage, read> particles : array<vec2<f32>>;
@group(0) @binding(1) var<storage, read_write> edges : array<Edge>;
@group(0) @binding(2) var<storage, read_write> edgeCount : atomic<u32>;
@group(0) @binding(3) var<uniform> radius : f32;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
  let i = gid.x;
  let N = arrayLength(&particles);
  if (i >= N) { return; }

  let pi = particles[i];
  for (var j = i + 1u; j < N; j++) {
    let pj = particles[j];
    let d = distance(pi, pj);
    if (d < radius) {
      let idx = atomicAdd(&edgeCount, 1u);
      if (idx < arrayLength(&edges)) {
        edges[idx] = Edge(i, j);
      }
    }
  }
}
`;

export const renderShaderCode = `
struct Edge {
  a : u32,
  b : u32,
};

@group(0) @binding(0) var<storage, read> particles : array<vec2<f32>>;

struct VSOut {
  @builtin(position) pos : vec4<f32>,
};

@vertex
fn vs_main(@location(0) edge : vec2<u32>, @builtin(vertex_index) vID : u32) -> VSOut {
  let idx = select(edge.x, edge.y, vID % 2u == 1u);
  let pos = particles[idx];
  var out : VSOut;
  out.pos = vec4<f32>(pos, 0.0, 1.0);
  return out;
}

@fragment
fn fs_main() -> @location(0) vec4<f32> {
  return vec4<f32>(1.0, 1.0, 1.0, 0.8);
}
`;
