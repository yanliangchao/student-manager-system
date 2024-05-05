import request from '/@/utils/request';

export function useClassApi() {
	return {
		getPage: (params?: object) => {
			return request({
				url: '/api/class/page',
				method: 'get',
				params,
			});
		},
		list: () => {
			return request({
				url: '/api/class/list',
				method: 'get',
			});
		},
		getSubTecById: (id: number) => {
			return request({
				url: '/api/class/list/sub/tec/' + id,
				method: 'get',
			});
		},
		add: (data: object) => {
			return request({
				url: '/api/class/add',
				method: 'post',
				data,
			});
		},
		addSubTec: (data: object) => {
			return request({
				url: '/api/class/add/sub/tec',
				method: 'post',
				data,
			});
		},
        mod: (data: object) => {
			return request({
				url: '/api/class/mod',
				method: 'put',
				data,
			});
		},
        del: (id: number) => {
			return request({
				url: '/api/class/del/' + id,
				method: 'delete',
			});
		},
		delSubTec: (data: object) => {
			return request({
				url: '/api/class/del/sub/tec',
				method: 'delete',
				data,
			});
		},
	};
}
