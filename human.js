import {tiny, defs} from './examples/common.js';

// Pull these names into this module's scope for convenience:
const {vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component} = tiny;

const shapes = {
	'sphere': new defs.Subdivision_Sphere(5),
	'capped_cylinder': new defs.Rounded_Capped_Cylinder(30, 30),
};

export const Articulated_Human =
	class Articulated_Human {
		constructor() {
			const sphere_shape = shapes.sphere;
			const phong = new defs.Phong_Shader();
			const tex_phong = new defs.Textured_Phong();
			this.materials = {};
			this.materials.plastic = {
				shader: phong,
				ambient: .5,
				diffusivity: .5,
				specularity: .5,
				color: color(.9, .5, .9, 1)
			};

			const human_cfg = {
				root_loc: [0, 1, 7],
				torso_scale: [1, 1.8, 0.5],

			};

			// torso node
			const torso_transform = Mat4.scale(...human_cfg.torso_scale);
			this.torso_node = new Node("torso", sphere_shape, torso_transform);
			// root->torso
			const root_location = Mat4.translation(...human_cfg.root_loc);
			this.root = new Arc("root", null, this.torso_node, root_location);

			// head node
			let head_transform = Mat4.scale(.6, .6, .6);
			head_transform.pre_multiply(Mat4.translation(0, .6, 0));
			this.head_node = new Node("head", sphere_shape, head_transform);
			// torso->neck->head
			const neck_location = Mat4.translation(0, 2, 0);
			this.neck = new Arc("neck", this.torso_node, this.head_node, neck_location);
			this.torso_node.children_arcs.push(this.neck);

			// right upper arm node
			let ru_arm_transform = Mat4.scale(1.2, .2, .2);
			ru_arm_transform.pre_multiply(Mat4.translation(1.2, 0, 0));
			this.ru_arm_node = new Node("ru_arm", sphere_shape, ru_arm_transform);
			// torso->r_shoulder->ru_arm
			const r_shoulder_location = Mat4.translation(0.5, 1.8, 0);
			this.r_shoulder = new Arc("r_shoulder", this.torso_node, this.ru_arm_node, r_shoulder_location);
			this.torso_node.children_arcs.push(this.r_shoulder)
			this.r_shoulder.set_dof(true, true, true);

			// right lower arm node
			let rl_arm_transform = Mat4.scale(1, .2, .2);
			rl_arm_transform.pre_multiply(Mat4.translation(1, 0, 0));
			this.rl_arm_node = new Node("rl_arm", sphere_shape, rl_arm_transform);
			// ru_arm->r_elbow->rl_arm
			const r_elbow_location = Mat4.translation(2.4, 0, 0);
			this.r_elbow = new Arc("r_elbow", this.ru_arm_node, this.rl_arm_node, r_elbow_location);
			this.ru_arm_node.children_arcs.push(this.r_elbow)
			this.r_elbow.set_dof(true, true, false);

			// right hand node
			let r_hand_transform = Mat4.scale(.4, .3, .2);
			r_hand_transform.pre_multiply(Mat4.translation(0.4, 0, 0));
			this.r_hand_node = new Node("r_hand", sphere_shape, r_hand_transform);
			// rl_arm->r_wrist->r_hand
			const r_wrist_location = Mat4.translation(2, 0, 0);
			this.r_wrist = new Arc("r_wrist", this.rl_arm_node, this.r_hand_node, r_wrist_location);
			this.rl_arm_node.children_arcs.push(this.r_wrist);
			this.r_wrist.set_dof(true, false, true);

			// CUE
			let cue_transform = Mat4.scale(2, .1, .1);
			cue_transform.pre_multiply(Mat4.translation(0.9, 0, 0));
			this.cue_node = new Node("cue", shapes.capped_cylinder, cue_transform);
			// rl_arm->r_wrist->r_hand->cue
			const cue_location = Mat4.translation(0.4, 0, 0);
			this.cue = new Arc("cue_joint", this.r_hand_node, this.cue_node, cue_location);
			this.r_hand_node.children_arcs.push(this.cue);


			// add the only end-effector
			const r_hand_end_local_pos = vec4(0.8, 0, 0, 1);
			this.end_effector = new End_Effector("cue", this.cue, r_hand_end_local_pos);
			this.cue.end_effector = this.end_effector;


			// LEFT
			// left upper arm node
			let lu_arm_transform = Mat4.scale(1.2, .2, .2);
			lu_arm_transform.pre_multiply(Mat4.translation(-1.2, 0, 0));
			this.lu_arm_node = new Node("lu_arm", sphere_shape, lu_arm_transform);
			// torso->l_shoulder->lu_arm
			const l_shoulder_location = Mat4.translation(-0.6, 1.8, 0);
			this.l_shoulder = new Arc("l_shoulder", this.torso_node, this.lu_arm_node, l_shoulder_location);
			this.torso_node.children_arcs.push(this.l_shoulder)
			this.l_shoulder.set_dof(true, true, true);

			// left lower arm node
			let ll_arm_transform = Mat4.scale(1, .2, .2);
			ll_arm_transform.pre_multiply(Mat4.translation(-1, 0, 0));
			this.ll_arm_node = new Node("ll_arm", sphere_shape, ll_arm_transform);
			// lu_arm->l_elbow->ll_arm
			const l_elbow_location = Mat4.translation(-2.4, 0, 0);
			this.l_elbow = new Arc("l_elbow", this.lu_arm_node, this.ll_arm_node, l_elbow_location);
			this.lu_arm_node.children_arcs.push(this.l_elbow)
			this.l_elbow.set_dof(true, true, false);
			// left hand node
			let l_hand_transform = Mat4.scale(.4, .3, .2);
			l_hand_transform.pre_multiply(Mat4.translation(-0.4, 0, 0));
			this.l_hand_node = new Node("l_hand", sphere_shape, l_hand_transform);
			// ll_arm->l_wrist->l_hand
			const l_wrist_location = Mat4.translation(-2, 0, 0);
			this.l_wrist = new Arc("l_wrist", this.ll_arm_node, this.l_hand_node, l_wrist_location);
			this.ll_arm_node.children_arcs.push(this.l_wrist);
			this.l_wrist.set_dof(true, false, true);

			// LEGS
			let ru_leg_transform = Mat4.scale(.2, 0.5, .2);
			ru_leg_transform.pre_multiply(Mat4.translation(.4, -2, 0));
			this.ru_leg_node = new Node("ru_leg", sphere_shape, ru_leg_transform);
			// torso->r_leg_joint1->ru_leg1
			const r_leg_joint1_location = Mat4.translation(0, -0.2, 0);
			this.r_leg_joint1 = new Arc("r_leg_joint1", this.torso_node, this.ru_leg_node, r_leg_joint1_location);
			this.torso_node.children_arcs.push(this.r_leg_joint1)
			this.r_leg_joint1.set_dof(true, true, true);
			// right lower leg node
			let rl_leg_transform = Mat4.scale(0.2, 0.5, .2);
			rl_leg_transform.pre_multiply(Mat4.translation(0.4, -2.6, 0));
			this.rl_leg_node = new Node("rl_leg", sphere_shape, rl_leg_transform);
			// ru_leg->r_joint2->rl_leg
			const r_leg_joint2_location = Mat4.translation(0, -0.3, 0);
			this.r_leg_joint2 = new Arc("r_leg_joint2", this.ru_leg_node, this.rl_leg_node, r_leg_joint2_location);
			this.ru_leg_node.children_arcs.push(this.r_leg_joint2)
			this.r_leg_joint2.set_dof(true, true, false);
			// right foot node
			let r_foot_transform = Mat4.scale(.2, .3, .4);
			r_foot_transform.pre_multiply(Mat4.translation(0.4, -3.0, -.2));
			this.r_foot_node = new Node("r_foot", sphere_shape, r_foot_transform);
			// rl_leg->r_leg_joint2->r_foot
			const r_foot_location = Mat4.translation(0, -0.3, 0);
			this.r_leg_joint3 = new Arc("r_leg_joint3", this.rl_leg_node, this.r_foot_node, r_foot_location);
			this.rl_leg_node.children_arcs.push(this.r_leg_joint3);
			this.r_leg_joint3.set_dof(true, false, true);

			let lu_leg_transform = Mat4.scale(.2, 0.5, .2);
			lu_leg_transform.pre_multiply(Mat4.translation(-.4, -2, 0));
			this.lu_leg_node = new Node("lu_leg", sphere_shape, lu_leg_transform);
			// torso->l_leg_joint1->lu_leg1
			const l_leg_joint1_location = Mat4.translation(0, -0.2, 0);
			this.l_leg_joint1 = new Arc("l_leg_joint1", this.torso_node, this.lu_leg_node, l_leg_joint1_location);
			this.torso_node.children_arcs.push(this.l_leg_joint1)
			this.l_leg_joint1.set_dof(true, true, true);
			// left lower leg node
			let ll_leg_transform = Mat4.scale(0.2, 0.5, .2);
			ll_leg_transform.pre_multiply(Mat4.translation(-0.4, -2.6, 0));
			this.ll_leg_node = new Node("ll_leg", sphere_shape, ll_leg_transform);
			// ru_leg->r_joint2->rl_leg
			const l_leg_joint2_location = Mat4.translation(0, -0.3, 0);
			this.l_leg_joint2 = new Arc("l_leg_joint2", this.lu_leg_node, this.ll_leg_node, l_leg_joint2_location);
			this.lu_leg_node.children_arcs.push(this.l_leg_joint2)
			this.l_leg_joint2.set_dof(true, true, false);
			// left foot node
			let l_foot_transform = Mat4.scale(.2, .3, .4);
			l_foot_transform.pre_multiply(Mat4.translation(-0.4, -3.0, -.2));
			this.l_foot_node = new Node("l_foot", sphere_shape, l_foot_transform);
			// ll_leg->l_leg_joint2->l_foot
			const l_foot_location = Mat4.translation(0, -0.3, 0);
			this.l_leg_joint3 = new Arc("l_leg_joint3", this.ll_leg_node, this.l_foot_node, l_foot_location);
			this.ll_leg_node.children_arcs.push(this.l_leg_joint3);
			this.l_leg_joint3.set_dof(true, false, true);

			// here I only use 7 dof
			this.dof = 7;
			this.Jacobian = null;
			// this.theta = [0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01];
			this.theta = [0, 0, 0, 0, 0, 0, 0];
			this.apply_theta();

			// JOINT INIT ROTATIONS
			// this.l_shoulder.articulation_matrix.pre_multiply(Mat4.rotation(0.9, 0, 0, 1));
			// this.l_elbow.articulation_matrix.pre_multiply(Mat4.rotation(0.9, 0, 0, 1))
			// this.r_shoulder.articulation_matrix.pre_multiply(Mat4.rotation(0.8, 0, 0, 1));
			// this.r_shoulder.articulation_matrix.pre_multiply(Mat4.rotation(-0.7, 0, 1, 0));
			// this.r_elbow.articulation_matrix.pre_multiply(Mat4.rotation(-1.9, 0, 0, 1));
			this.cue.articulation_matrix.pre_multiply(Mat4.rotation(1.57, 0, 0, 1));
			// this.cue.articulation_matrix.pre_multiply(Mat4.rotation(1.57, 1, 0, 0));
			// this.
		}

		// mapping from global theta to each joint theta
		apply_theta() {
			this.theta[2] = Math.min(-0.1, this.theta[2]);  // Limit shoulder
			this.theta[1] = Math.min(-0.1, this.theta[1]);  // Limit shoulder
			this.r_shoulder.update_articulation(this.theta.slice(0, 3));
			this.r_elbow.update_articulation(this.theta.slice(3, 5));
			this.r_wrist.update_articulation(this.theta.slice(5, 7));
		}

		calculate_Jacobian() {
			let J = new Array(3);
			for (let i = 0; i < 3; i++) {
				J[i] = new Array(this.dof);
			}
			let ef_pos = this.get_end_effector_position();
			for (let j = 0; j < this.dof; j++) {
				const pi = 3.14159265
				if (this.theta[j] >= 2 * pi)
					this.theta[j] = 0.001
				if (this.theta[j] <= -2 * pi)
					this.theta[j] = 0.001
			}
			this.old_theta = this.theta.slice();
			for (let j = 0; j < this.dof; j++) {
				// let d_theta = -1e-7 * Math.sign(this.theta[j]);
				let d_theta = 1e-7 * Math.sign(Math.random() - 0.5);
				this.theta[j] += d_theta;
				this.apply_theta()
				let new_ef_pos = this.get_end_effector_position();

				let dx = new_ef_pos.minus(ef_pos);
				this.theta = this.old_theta.slice();
				this.apply_theta();
				this.get_end_effector_position();
				for (let i = 0; i < 3; i++) {
					J[i][j] = dx[i] / d_theta
				}
			}

			// console.log("J", J);
			// console.log("Theta", this.theta);
			return J; // 3x7 in my case.
		}

		calculate_delta_theta(J, dx) {
			const A = math.multiply(math.transpose(J), J);
			// console.log("A", A);
			const b = math.multiply(math.transpose(J), dx);
			// console.log("b", b);
			let x = [...Array(this.dof)].map(e => Array(1).fill(0.01));
			try {
				x = math.lusolve(A, b)
			} catch (err) {
				console.log(err);
				// console.log(this.theta);
				let rand_theta = (Math.random()-0.5) / 10
				// this.theta += [0, 0, 0, 0, 0, 0, 0];
				// this.apply_theta();
				// console.log(dx);
				this.move_end_effector_relative([[rand_theta], [rand_theta], [rand_theta]]);
				// x = this.theta.map((v, i) => v + dtheta[i][0]);
			}
			for (let i = 0; i < this.dof; i++){
				const change_limit = 0.05;
				x[i][0] = Math.min(change_limit, Math.max(-change_limit, x[i][0]));
			}
			// console.log("x", x);
			// console.log("b", b);
			return x;
		}

		get_end_effector_position() {
			// in this example, we only have one end effector.
			this.matrix_stack = [];
			this._rec_update(this.root, Mat4.identity());
			const v = this.end_effector.global_position; // vec4
			return vec3(v[0], v[1], v[2]);
		}

		_rec_update(arc, matrix) {
			if (arc !== null) {
				const L = arc.location_matrix;
				const A = arc.articulation_matrix;
				matrix.post_multiply(L.times(A));
				this.matrix_stack.push(matrix.copy());

				if (arc.end_effector !== null) {
					arc.end_effector.global_position = matrix.times(arc.end_effector.local_position);
				}

				const node = arc.child_node;
				const T = node.transform_matrix;
				matrix.post_multiply(T);

				matrix = this.matrix_stack.pop();
				for (const next_arc of node.children_arcs) {
					this.matrix_stack.push(matrix.copy());
					this._rec_update(next_arc, matrix);
					matrix = this.matrix_stack.pop();
				}
			}
		}

		draw(webgl_manager, uniforms) {
			this.matrix_stack = [];
			this._rec_draw(this.root, Mat4.identity(), webgl_manager, uniforms, this.materials.plastic);
		}

		_rec_draw(arc, matrix, webgl_manager, uniforms, material) {
			if (arc !== null) {
				const L = arc.location_matrix;
				const A = arc.articulation_matrix;
				matrix.post_multiply(L.times(A));
				this.matrix_stack.push(matrix.copy());

				const node = arc.child_node;
				const T = node.transform_matrix;
				matrix.post_multiply(T);
				node.shape.draw(webgl_manager, uniforms, matrix, material);

				matrix = this.matrix_stack.pop();
				for (const next_arc of node.children_arcs) {
					this.matrix_stack.push(matrix.copy());
					this._rec_draw(next_arc, matrix, webgl_manager, uniforms, material);
					matrix = this.matrix_stack.pop();
				}
			}
		}

		move_end_effector(target_pos) {
			let dx = target_pos.minus(this.get_end_effector_position());
			dx = [[dx[0]], [dx[1]], [dx[2]]];
			this.move_end_effector_relative(dx);
		}

		move_end_effector_relative(dx) {
			const J = this.calculate_Jacobian();
			const dtheta = this.calculate_delta_theta(J, dx);
			for (let i = 0; i < this.dof; i++)
				if (dtheta[i][0] === 0)
					dtheta[i][0] = dtheta[i][0] + 0.00000001 * (Math.random()-0.5)
			this.theta = this.theta.map((v, i) => v + dtheta[i][0]);  // Help with when J=0
			this.apply_theta();
		}

		debug(arc = null, id = null) {

			// this.theta = this.theta.map(x => x + 0.01);
			// this.apply_theta();
			// const J = this.calculate_Jacobian();
			let dx = [[0], [-0.02], [0]];
			if (id === 2)
				dx = [[-0.02], [0], [0]];
			this.move_end_effector_relative(dx);
			// const dtheta = this.calculate_delta_theta(J, dx);

			// const direction = new Array(this.dof);
			// let norm = 0;
			// for (let i = 0; i < direction.length; i++) {
			//     direction[i] = dtheta[i][0];
			//     norm += direction[i] ** 2.0;
			// }
			// norm = norm ** 0.5;
			// console.log(direction);
			// console.log(norm);
			// this.theta = this.theta.map((v, i) => v + 0.01 * (direction[i] / norm));
			// this.theta = this.theta.map((v, i) => v + dtheta[i][0]);
			// this.apply_theta();

			// if (arc === null)
			//     arc = this.root;
			//
			// if (arc !== this.root) {
			//     arc.articulation_matrix = arc.articulation_matrix.times(Mat4.rotation(0.02, 0, 0, 1));
			// }
			//
			// const node = arc.child_node;
			// for (const next_arc of node.children_arcs) {
			//     this.debug(next_arc);
			// }
		}
	}

class Node {
	constructor(name, shape, transform) {
		this.name = name;
		this.shape = shape;
		this.transform_matrix = transform;
		this.children_arcs = [];
	}
}

class Arc {
	constructor(name, parent, child, location) {
		this.name = name;
		this.parent_node = parent;
		this.child_node = child;
		this.location_matrix = location;
		this.articulation_matrix = Mat4.identity();
		this.end_effector = null;
		this.dof = {
			Rx: false,
			Ry: false,
			Rz: false,
		}
	}

	// Here I only implement rotational DOF
	set_dof(x, y, z) {
		this.dof.Rx = x;
		this.dof.Ry = y;
		this.dof.Rz = z;
	}

	update_articulation(theta) {
		this.articulation_matrix = Mat4.identity();
		let index = 0;
		if (this.dof.Rx) {
			this.articulation_matrix.pre_multiply(Mat4.rotation(theta[index], 1, 0, 0));
			index += 1;
		}
		if (this.dof.Ry) {
			this.articulation_matrix.pre_multiply(Mat4.rotation(theta[index], 0, 1, 0));
			index += 1;
		}
		if (this.dof.Rz) {
			this.articulation_matrix.pre_multiply(Mat4.rotation(theta[index], 0, 0, 1));
		}
	}
}

class End_Effector {
	constructor(name, parent, local_position) {
		this.name = name;
		this.parent = parent;
		this.local_position = local_position;
		this.global_position = null;
	}
}