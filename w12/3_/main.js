const can = document.querySelector("canvas");
const gl = can.getContext("webgl2");

async function main(){
	let buffers = twgl.primitives.createSphereBuffers(gl,10,48,24);

	// setup GLSL program
	let program = twgl.createProgramFromSources(gl,[
		await (await fetch("./shaders/main.vert")).text(),
		await (await fetch("./shaders/main.frag")).text()
	]);
	let uniformSetters = twgl.createUniformSetters(gl,program);
	let attribSetters = twgl.createAttributeSetters(gl,program);

	let attribs = {
		a_position: {buffer:buffers.position, numComponents:3},
		a_normal:   {buffer:buffers.normal,   numComponents:3},
		a_texcoord: {buffer:buffers.texcoord, numComponents:2}
	};

	let vao = twgl.createVAOAndSetAttributes(
		gl,attribSetters,attribs,buffers.indices
	);

	function degToRad(d){
		return d / 180 * Math.PI;
	}

	let fieldOfViewRadians = degToRad(60);

	let uniformsForAll = {
		u_lightWorldPos: [-50,30,100],
		u_viewInverse:   m4.identity(),
		u_lightColor:    [1,1,1,1]
	};

	let uniformsForEach = {
		u_worldViewProjection: m4.identity(),
		u_world: m4.identity(),
		u_worldInverseTranspose: m4.identity()
	};

	let rand = function(min,max){
		if(max == undefined){
			max = min;
			min = 0;
		}
		return min + Math.random()*(max-min);
	};

	let randInt = function(range){
		return Math.floor(Math.random()*range);
	};

	let textures = [
		textureUtils.makeStripeTexture(gl,{color1:"#FFF",color2:"#CCC"}),
		textureUtils.makeCheckerTexture(gl,{color1:"#FFF",color2:"#CCC"}),
		textureUtils.makeCircleTexture(gl,{color1:"#FFF",color2:"#CCC"}),
	];

	let objs = [];
	let numObjs = 300;
	let baseColor = rand(240);
	for(let ii = 0; ii < numObjs; ++ii){
		objs.push({
			radius: rand(150),
			xRotation: rand(Math.PI*2),
			yRotation: rand(Math.PI),
			materialUniforms:{
				u_colorMult: chroma.hsv(rand(baseColor,baseColor+120),0.5,1).gl(),
				u_diffuse: textures[randInt(textures.length)],
				u_specular: [1,1,1,1],
				u_shininess: rand(500),
				u_specularFactor: rand(1)
			}
		});
	}

	requestAnimationFrame(drawScene);

	// draw the scene
	function drawScene(time){
		time = 5 + time * 0.0001;

		twgl.resizeCanvasToDisplaySize(gl.canvas);

		// tell webgl how to convert from clip space to pixels
		gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);

		// compute the projection matrix
		let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
		let projectionMatrix = m4.perspective(fieldOfViewRadians,aspect,1,2000);

		// compute the camera's matrix using lookat
		let cameraPosition = [0,0,100];
		let target = [0,0,0];
		let up = [0,1,0];
		let cameraMatrix = m4.lookAt(cameraPosition,target,up,uniformsForAll.u_viewInverse);

		// make a view matrix from the camera matrix
		let viewMatrix = m4.inverse(cameraMatrix);

		let viewProjectionMatrix = m4.multiply(projectionMatrix,viewMatrix);

		gl.useProgram(program);

		// setup all the needed attributes
		gl.bindVertexArray(vao);

		// set the uniforms that are the same for all objects
		twgl.setUniforms(uniformSetters,uniformsForAll);

		// draw objs
		for(const obj of objs){
			// compute position for this obj based on time
			let worldMatrix = m4.identity();
			worldMatrix = m4.yRotate(worldMatrix,obj.yRotation * time);
			worldMatrix = m4.xRotate(worldMatrix,obj.xRotation * time);
			worldMatrix = m4.translate(worldMatrix,0,0,obj.radius,uniformsForEach.u_world);

			// multiply the matrices
			m4.multiply(viewProjectionMatrix,worldMatrix,uniformsForEach.u_worldViewProjection);
			m4.transpose(m4.inverse(worldMatrix), uniformsForEach.u_worldInverseTranspose);

			// set the uniforms we just computed
			twgl.setUniforms(uniformSetters,uniformsForEach);

			// set the uniforms for this specific obj
			twgl.setUniforms(uniformSetters,obj.materialUniforms);

			// draw the geometry
			gl.drawElements(gl.TRIANGLES,buffers.numElements,gl.UNSIGNED_SHORT,0);

		}

		requestAnimationFrame(drawScene);
	}

}

main();