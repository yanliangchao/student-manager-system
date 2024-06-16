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
		listBySid: (sid: number) => {
			return request({
				url: '/api/dormitory/list/' + sid,
				method: 'get',
			});
		},
		getStuByid: (id: number) => {
			return request({
				url: '/api/dormitory/list/stu/' +id,
				method: 'get',
			});
		},
		getLeaveStuByid: (id: number) => {
			return request({
				url: '/api/dormitory/list/leave/stu/' +id,
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
		getStorey: (params?: object) => {
			return request({
				url: '/api/dormitory/storey',
				method: 'get',
				params,
			});
		},
		pingfen: (data: object) => {
			return request({
				url: '/api/dormitory/add/pingfen',
				method: 'post',
				data,
			});
		},
		pingfenPrint: (params?: object) => {
			return request({
				url: '/api/dormitory/list/print/pingfen',
				method: 'get',
				params,
			});
		},
		personalPrint: (id: number, params?: object) => {
			return request({
				url: '/api/dormitory/print/pingfen/' + id,
				method: 'get',
				params,
			});
		},
		dianming: (data: object) => {
			return request({
				url: '/api/dormitory/add/dianming',
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
