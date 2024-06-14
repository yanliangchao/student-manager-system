import request from '/@/utils/request';

/**
 * （不建议写成 request.post(xxx)，因为这样 post 时，无法 params 与 data 同时传参）
 *
 * 登录api接口集合
 * @method signIn 用户登录
 * @method signOut 用户退出登录
 */
export function useHomeApi() {
	return {
		getCount: () => {
			return request({
				url: '/api/home/count',
				method: 'get',
			});
		},
		getSchoolCount: () => {
			return request({
				url: '/api/home/school/count',
				method: 'get',
			});
		},
		getTeacherCount: (id: number) => {
			return request({
				url: '/api/home/teacher/count/' + id,
				method: 'get',
			});
		},
		getDormitoryCount: (id: number) => {
			return request({
				url: '/api/home/dormitory/count/' + id,
				method: 'get',
			});
		},
		getClassCount: (id: number) => {
			return request({
				url: '/api/home/class/count/' + id,
				method: 'get',
			});
		},
		getLeave: () => {
			return request({
				url: '/api/home/school/leave',
				method: 'get',
			});
		},
		getTeacherPinfen: () => {
			return request({
				url: '/api/home/teacher/pinfen',
				method: 'get',
			});
		},
	};
}
