import {tiny, defs} from './examples/common.js';

// Pull these names into this module's scope for convenience:
const {vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component} = tiny;
import {Line, PhysicsEngine, Ball, BallPhong} from './ball_physics.js';
import {Table} from "./table.js";
import {Articulated_Human, HumanController} from "./human.js";

export const MainBase = defs.MainBase =
	class MainBase extends Component {
		init() {
			console.log("init")
			this.shapes = {
				'box': new defs.Cube(),
				'ball': new defs.Subdivision_Sphere(4),
				'axis': new defs.Axis_Arrows(),
				'line': new Line()
			};
			const phong = new defs.Phong_Shader();
			const tex_phong = new defs.Textured_Phong();
			const ballshader = new BallPhong()


			this.materials = {};

			this.materials.rgb = {shader: tex_phong, ambient: .5, texture: new Texture("assets/rgb.jpg")}
			this.materials.ballmaterial = {
					shader: ballshader,
					ambient: .8,
					diffusivity: 1,
					specularity: 1,
					color: color(.9, .5, .9, 1)
			}


			this.ball_location = vec3(1, 1, 1);
			this.ball_radius = 0.25;
			this.init_balls(9);

			this.table_dimensions = {"x": 4, "y": 6};
			// BALL PHYSICS
			this.physics = new PhysicsEngine(
				-this.table_dimensions.x, this.table_dimensions.x, this.table_dimensions.y, -this.table_dimensions.y);
			// TABLE
			this.table = new Table(this.table_dimensions.x, this.table_dimensions.y);
			// HUMAN
			this.human_controller = new HumanController();
			// this.human = new Articulated_Human();
		}

		init_balls(N) {
			this.balls = []
			const init_v = 6
			const init_p = 3


			for (let i = 0; i < N; i++) {
				this.balls.push(new Ball(color(Math.random(), Math.random(), Math.random(), 1.0)))
				this.balls[i].position = vec3(Math.random() * init_p, -1, Math.random() * init_p)
				this.balls[i].velocity = vec3(Math.random() * init_v, 0, Math.random() * init_v)
			}
		}

		draw_ball(ball, caller) {
			let m = Mat4.scale(ball.radius, ball.radius, ball.radius)
			m = Mat4.translation(ball.position[0], ball.radius + 0.01, ball.position[2]).times(m) // radius + height of the board
			m = m.times(ball.rotation_matrix)
			this.shapes.ball.draw(caller, this.uniforms, m, {...this.materials.ballmaterial, color: ball.color})
			//this.shapes.ball.draw(caller, this.uniforms, m, this.materials.metal)
		}

		draw_balls(caller) {
			for (let i = 0; i < this.balls.length; i++) {
				this.draw_ball(this.balls[i], caller)
			}
		}

		render_animation(caller) {  // display():  Called once per frame of animation.  We'll isolate out
			// the code that actually draws things into Collisions, a
			// subclass of this Scene.  Here, the base class's display only does
			// some initial setup.

			// Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
			if (!caller.controls) {
				this.animated_children.push(caller.controls = new defs.Movement_Controls({uniforms: this.uniforms}));
				caller.controls.add_mouse_controls(caller.canvas);

				// Define the global camera and projection matrices, which are stored in shared_uniforms.  The camera
				// matrix follows the usual format for transforms, but with opposite values (cameras exist as
				// inverted matrices).  The projection matrix follows an unusual format and determines how depth is
				// treated when projecting 3D points onto a plane.  The Mat4 functions perspective() or
				// orthographic() automatically generate valid matrices for one.  The input arguments of
				// perspective() are field of view, aspect ratio, and distances to the near plane and far plane.

				// !!! Camera changed here
				Shader.assign_camera(Mat4.look_at(vec3(10, 4, -8), vec3(0, 0, 1), vec3(0, 1, 0)), this.uniforms);
				//Shader.assign_camera( Mat4.look_at (vec3 (0, 0, 3), vec3 (0, 0, 0), vec3 (0, 1, 0)), this.uniforms );
			}
			this.uniforms.projection_transform = Mat4.perspective(Math.PI / 4, caller.width / caller.height, 1, 100);

			// *** Lights: *** Values of vector or point lights.  They'll be consulted by
			// the shader when coloring shapes.  See Light's class definition for inputs.
			const t = this.t = this.uniforms.animation_time / 1000;

			const light_position = vec4(20, 20, 20, 1.0);
			this.uniforms.lights = [defs.Phong_Shader.light_source(light_position, color(1, 1, 1, 1), 1000)];
		}
	}

export class Main extends MainBase {
	render_animation(caller) {
		super.render_animation(caller);

		/**********************************
		Start coding down here!!!!
		**********************************/

		const t = this.t = this.uniforms.animation_time / 1000;


		let dt = this.uniforms.animation_delta_time / 1000
		dt = Math.min(1 / 60, dt)
		let t_step = 1 / 1000

		let t_sim = this.uniforms.animation_time / 1000
		let t_next = t_sim + dt // t_sim is the simulation time

		for (; t_sim <= t_next; t_sim += t_step) {
			this.physics.collide_walls(this.balls)
			this.physics.apply_friction(this.balls)
			this.physics.update_velocity(this.balls, t_step)
			this.physics.update_positions(this.balls, t_step)
		}
		this.draw_balls(caller);
		this.physics.collide_balls(this.balls);

		// HUMAN
		if (this.human_controller.moving) {
			this.human_controller.move(dt, caller, this.uniforms);
		}
		this.human_controller.human.draw(caller, this.uniforms);
		// TABLE
		this.table.draw(caller, this.uniforms);
	}

	render_controls() { // render_controls(): Sets up a panel of interactive HTML elements, including
		// render_controls(): Sets up a panel of interactive HTML elements, including
		// buttons with key bindings for affecting this scene, and live info readouts.
		this.control_panel.innerHTML += "Assignment 2: IK Engine";
		this.new_line();
		// TODO: You can add your button events for debugging. (optional)
		this.key_triggered_button("Debug", ["Shift", "D"],
			this.human_controller.start_move(0, 0.3, 5, 0, 0, 15));
		this.new_line();
	}
}
