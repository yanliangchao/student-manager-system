import request from '/@/utils/request';

/**
 * （不建议写成 request.post(xxx)，因为这样 post 时，无法 params 与 data 同时传参）
 *
 * 登录api接口集合
 * @method signIn 用户登录
 * @method signOut 用户退出登录
 */
export function useUserApi() {
	return {
		getPage: (params?: object) => {
			return request({
				url: '/api/user/page',
				method: 'get',
				params,
			});
		},
		list: () => {
			return request({
				url: '/api/user/list',
				method: 'get',
			});
		},
		findByUsername: (username: string) => {
			return request({
				url: '/api/user/' + username,
				method: 'get',
			});
		},
		add: (data: object) => {
			return request({
				url: '/api/user/add',
				method: 'post',
				data,
			});
		},
        mod: (data: object) => {
			return request({
				url: '/api/user/mod',
				method: 'put',
				data,
			});
		},
		modRole: (data: object) => {
			return request({
				url: '/api/user/modRole',
				method: 'put',
				data,
			});
		},
        del: (id: number) => {
			return request({
				url: '/api/user/del/' + id,
				method: 'delete',
			});
		},
	};
}
