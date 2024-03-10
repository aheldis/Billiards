import {tiny, defs} from './examples/common.js';
import {Ball} from './ball_physics.js';
// Pull these names into this module's scope for convenience:
const {vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component} = tiny;

export class TrajectoryArrow {
    constructor(start) {
        this.shapes = { 'cylinder' : new defs.Capped_Cylinder(1, 16),
                        'cone': new defs.Closed_Cone(1, 16) };
        this.material = {shader: new defs.Phong_Shader(), ambient: 1.0, color: color(1, 0, 0, 1)}
        this.length = 1.0;
        this.start = start;
        this.angle = 0.0;   // angle around y axis
        this.tip_length = 0.2;
        this.radius = 0.1;
        this.offset = 0.2;
    }

    adjust_angle(theta) {
        this.angle += theta;
    }

    adjust_length(l) {
        if (l > 0 || this.length > 3 * this.tip_length) {
            this.length += l;
        }
    }

    draw(webgl_manager, uniforms) {
        let cyl_length = this.length - this.tip_length;
        let cylinder_transform = Mat4.scale(this.radius, this.radius, cyl_length);
        cylinder_transform.pre_multiply(Mat4.translation(this.start[0], this.start[1], -cyl_length/2 - this.offset));
        cylinder_transform.pre_multiply(Mat4.rotation(this.angle, 0, 1, 0));
        cylinder_transform.pre_multiply(Mat4.translation(0, 0, this.start[2]));
        
        let cone_transform = Mat4.scale(this.radius * 2, this.radius * 2, this.tip_length);
        cone_transform.pre_multiply(Mat4.rotation(Math.PI, 0, 1, 0));
        cone_transform.pre_multiply(Mat4.translation(0, 0, -cyl_length - this.offset));
        cone_transform.pre_multiply(Mat4.rotation(this.angle, 0, 1, 0));
        cone_transform.pre_multiply(Mat4.translation(this.start[0] , this.start[1], this.start[2]));

        this.shapes.cylinder.draw(webgl_manager, uniforms, cylinder_transform, this.material);
        this.shapes.cone.draw(webgl_manager, uniforms, cone_transform, this.material);
    }
}