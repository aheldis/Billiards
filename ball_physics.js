import {tiny, defs} from './examples/common.js';

// Pull these names into this module's scope for convenience:
const {vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component} = tiny;


export class Line extends Shape {
	constructor() {
		super("position", "normal")
		this.material = {shader: new defs.Phong_Shader(), ambient: 1.0, color: color(1, 0, 0, 1)}
		this.arrays.position.push(vec3(0, 0, 0))
		this.arrays.normal.push(vec3(0, 0, 0))
		this.arrays.position.push(vec3(1, 0, 0))
		this.arrays.normal.push(vec3(0, 0, 0))
	}

	draw(webgl_manager, uniforms) {
		super.draw(webgl_manager, uniforms, Mat4.identity(), this.material, "LINE_STRIP");
	}

	update(webgl_manager, uniforms, x1, x2) {
		this.arrays.position[0] = x1
		this.arrays.position[1] = x2
		this.copy_onto_graphics_card(webgl_manager.context)
	}
}

export class Ball {
	constructor(ball_color, radius = 0.2) {
		this.color = ball_color
		this.position = vec3(0, 0, 0)
		this.velocity = vec3(0, 0, 0)
		this.acceleration = vec3(0, 0, 0)
		this.radius = radius
	}
}

export class PhysicsEngine {
	constructor(left = -3, right = 3, top = 3, bottom = -3) {
		this.left = left
		this.right = right
		this.top = top
		this.bottom = bottom
		this.friction_coef = 2.0
	}

	apply_friction(balls) {
		for (let i = 0; i < balls.length; i++) {
			balls[i].acceleration = balls[i].velocity.normalized().times(-this.friction_coef)
		}
	}

	update_velocity(balls, dt) {
		for (let i = 0; i < balls.length; i++) {
			balls[i].velocity = balls[i].velocity.plus(balls[i].acceleration.times(dt))
		}
	}

	update_positions(balls, dt) {
		for (let i = 0; i < balls.length; i++) {
			balls[i].position = balls[i].position.plus(balls[i].velocity.times(dt))
		}
	}

	collide_balls(balls) {
		for (let i = 0; i < balls.length - 1; i++) {
			for (let j = i + 1; j < balls.length; j++) {
				const d_position = balls[i].position.minus(balls[j].position)
				if (d_position.norm() < (balls[i].radius + balls[j].radius)) {
					const d_velocity = balls[i].velocity.minus(balls[j].velocity)
					if (d_velocity.dot(d_position) > 0) {
						// Meaning the collision has already been detected and hence we can skip
						continue
					}

					// Following https://en.wikipedia.org/wiki/Elastic_collision#Two-dimensional
					const d_position_unitvector = d_position.normalized()
					const v1_normal = d_position_unitvector.times(d_position_unitvector.dot(balls[i].velocity))
					const v1_tangent = balls[i].velocity.minus(v1_normal)
					const v2_normal = d_position_unitvector.times(d_position_unitvector.dot(balls[j].velocity))
					const v2_tangent = balls[j].velocity.minus(v2_normal)

					const new_v1 = v1_tangent.plus(v2_normal)
					const new_v2 = v2_tangent.plus(v1_normal)

					balls[i].velocity = new_v1
					balls[j].velocity = new_v2
				}
			}
		}
	}

	collide_walls(balls) {
		for (let i = 0; i < balls.length; i++) {
			if (balls[i].position[0] - balls[i].radius < this.left) {
				balls[i].velocity[0] = Math.abs(balls[i].velocity[0])
			} else if (balls[i].position[0] + balls[i].radius > this.right) {
				balls[i].velocity[0] = -Math.abs(balls[i].velocity[0])
			}
			if (balls[i].position[2] - balls[i].radius < this.bottom) {
				balls[i].velocity[2] = Math.abs(balls[i].velocity[2])
			} else if (balls[i].position[2] + balls[i].radius > this.top) {
				balls[i].velocity[2] = -Math.abs(balls[i].velocity[2])
			}
		}
	}
}