import request from '/@/utils/request';

/**
 * （不建议写成 request.post(xxx)，因为这样 post 时，无法 params 与 data 同时传参）
 *
 * 登录api接口集合
 * @method signIn 用户登录
 * @method signOut 用户退出登录
 */
export function useStudentApi() {
	return {
		getPage: (params?: object) => {
			return request({
				url: '/api/student/page',
				method: 'get',
				params,
			});
		},
		getPageByCid: (id: number, params?: object) => {
			return request({
				url: '/api/student/page/cid/' + id,
				method: 'get',
				params,
			});
		},
		list: (gid: number) => {
			return request({
				url: '/api/student/list/' + gid,
				method: 'get',
			});
		},
		add: (data: object) => {
			return request({
				url: '/api/student/add',
				method: 'post',
				data,
			});
		},
        mod: (data: object) => {
			return request({
				url: '/api/student/mod',
				method: 'put',
				data,
			});
		},
        del: (id: number) => {
			return request({
				url: '/api/student/del/' + id,
				method: 'delete',
			});
		},
	};
}
