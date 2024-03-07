import {tiny, defs} from './examples/common.js';

// Pull these names into this module's scope for convenience:
const {vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component} = tiny;

export const Table =
	class Table {
		constructor(table_dim_x, table_dim_y) {
			const phong = new defs.Phong_Shader();
			const tex_phong = new defs.Textured_Phong();
			this.shapes = {
				'box': new defs.Cube(),
				'ball': new defs.Subdivision_Sphere(4),
				'axis': new defs.Axis_Arrows(),
				// 'line': new Line()
			};
			this.materials = {};
			this.materials.board = {
				shader: phong,
				ambient: 1.0,
				diffusivity: 1,
				specularity: .3,
				color: color(26 / 255, 138 / 255, 95 / 255, 1)
			}
			this.table_dim_x = table_dim_x;
			this.table_dim_y = table_dim_y;
		}

		draw(webgl_manager, uniforms) {
			this.matrix_stack = [];
			let floor_transform = Mat4.translation(0, 0, 0).times(Mat4.scale(this.table_dim_x, 0.01, this.table_dim_y));
			this.shapes.box.draw(webgl_manager, uniforms, floor_transform, this.materials.board);
		}
	}