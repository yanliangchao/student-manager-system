import request from '/@/utils/request';

export function useDormitoryApi() {
	return {
		getPage: (params?: object) => {
			return request({
				url: '/api/dormitory/page',
				method: 'get',
				params,
			});
		},
		list: () => {
			return request({
				url: '/api/dormitory/list',
				method: 'get',
			});
		},
		getStuByid: (id: number) => {
			return request({
				url: '/api/dormitory/list/stu/' +id,
				method: 'get',
			});
		},
		add: (data: object) => {
			return request({
				url: '/api/dormitory/add',
				method: 'post',
				data,
			});
		},
		addStu: (data: object) => {
			return request({
				url: '/api/dormitory/add/stu',
				method: 'post',
				data,
			});
		},
        mod: (data: object) => {
			return request({
				url: '/api/dormitory/mod',
				method: 'put',
				data,
			});
		},
		modStu: (data: object) => {
			return request({
				url: '/api/dormitory/mod/stu',
				method: 'put',
				data,
			});
		},
        del: (id: number) => {
			return request({
				url: '/api/dormitory/del/' + id,
				method: 'delete',
			});
		},
		delStu: (id: number) => {
			return request({
				url: '/api/dormitory/del/stu/' + id,
				method: 'delete',
			});
		},
	};
}
