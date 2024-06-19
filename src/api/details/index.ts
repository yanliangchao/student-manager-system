import request from '/@/utils/request';

/**
 * （不建议写成 request.post(xxx)，因为这样 post 时，无法 params 与 data 同时传参）
 *
 * 登录api接口集合
 * @method signIn 用户登录
 * @method signOut 用户退出登录
 */
export function useDetailsApi() {
	return {
		getPage: (id: number, params?: object) => {
			return request({
				url: '/api/details/page/' + id,
				method: 'get',
				params,
			});
		},
		list: () => {
			return request({
				url: '/api/details/list',
				method: 'get',
			});
		},
		listBySid: (id: number, sid: number) => {
			return request({
				url: '/api/details/list/' + id + "/" + sid,
				method: 'get',
			});
		},
		add: (data: object) => {
			return request({
				url: '/api/details/add',
				method: 'post',
				data,
			});
		},
		getLeave: (params?: object) => {
			return request({
				url: '/api/details/page/leave',
				method: 'get',
				params,
			});
		},
		addLeave: (data: object) => {
			return request({
				url: '/api/details/add/leave',
				method: 'post',
				data,
			});
		},
        mod: (data: object) => {
			return request({
				url: '/api/details/mod',
				method: 'put',
				data,
			});
		},
        del: (id: number) => {
			return request({
				url: '/api/details/del/' + id,
				method: 'delete',
			});
		},
	};
}
