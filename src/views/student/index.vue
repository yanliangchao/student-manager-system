<template>
	<div class="system-user-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto">
			<div class="system-user-search mb15">
				<el-input v-model="state.tableData.param.search" size="default" placeholder="请输入班级名称" style="max-width: 180px"> </el-input>
				<el-button size="default" type="primary" class="ml10" @click="getTableData()">
					<el-icon>
						<ele-Search />
					</el-icon>
					查询
				</el-button>
				<el-button size="default" type="success" class="ml10" @click="onOpenAddUser('add')" v-if="!userInfos.roles.includes('common')">
					<el-icon>
						<ele-FolderAdd />
					</el-icon>
					新增学生
				</el-button>
				<el-button size="default" type="success" class="ml10" @click="onOpenAddUser('all')" v-if="!userInfos.roles.includes('common')">
					<el-icon>
						<ele-FolderAdd />
					</el-icon>
					导入学生
				</el-button>
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
				<el-table-column type="index" label="序号" width="60" />
				<el-table-column prop="name" label="姓名" show-overflow-tooltip></el-table-column>
				<el-table-column prop="gender" label="性别" show-overflow-tooltip>
					<template #default="scope">
						{{ scope.row.gender == 1 ? '女' : '男' }}
					</template>
				</el-table-column>
				<el-table-column prop="iphone" label="手机" show-overflow-tooltip></el-table-column>
				<el-table-column prop="address" label="地址" show-overflow-tooltip></el-table-column>
				<el-table-column prop="school_name" label="学校" show-overflow-tooltip></el-table-column>
				<el-table-column prop="class_name" label="班级" show-overflow-tooltip></el-table-column>
				<el-table-column prop="subjects" label="主修科目" show-overflow-tooltip>
					<template #default="scope">
						<el-text class="mx-1" :type="getColor.get((k + 1)%5)" v-for="(v, k) in scope.row.subjects" :key="k" >
							{{ v.name.charAt(0) }}
							<span v-if="k < scope.row.subjects.length - 1"> | </span>
						</el-text>
					</template>
				</el-table-column>
				<el-table-column prop="dormitory_name" label="寝室" show-overflow-tooltip>
					<template #default="scope">
						{{ scope.row.building }} - {{  scope.row.dormitory_name }} - {{  scope.row.number }}
					</template>
				</el-table-column>
				<el-table-column prop="father" label="父亲" show-overflow-tooltip>
					<template #default="scope">
						<el-tooltip class="box-item" effect="dark" :content="scope.row.father_iphone" placement="top-end">
							{{ scope.row.father }}
						</el-tooltip>
					</template>
				</el-table-column>
				<el-table-column prop="mother" label="母亲" show-overflow-tooltip>
					<template #default="scope">
						<el-tooltip class="box-item" effect="dark" :content="scope.row.mother_iphone" placement="top-end">
							{{ scope.row.mother }}
						</el-tooltip>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="150">
					<template #default="scope">
						<el-button size="small" text type="success" @click="onOpenDetails(scope.row)"
							>违纪</el-button
						>
						<el-button v-if="!userInfos.roles.includes('common')" size="small" text type="primary" @click="onOpenEditUser('edit', scope.row)"
							>修改</el-button
						>
						<el-button v-if="!userInfos.roles.includes('common')" size="small" text type="danger" @click="onRowDel(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination
				@size-change="onHandleSizeChange"
				@current-change="onHandleCurrentChange"
				class="mt15"
				:pager-count="5"
				:page-sizes="[10, 20, 30]"
				v-model:current-page="state.tableData.param.pageNum"
				background
				v-model:page-size="state.tableData.param.pageSize"
				layout="total, sizes, prev, pager, next, jumper"
				:total="state.tableData.total"
			>
			</el-pagination>
		</el-card>
		<UserDialog ref="userDialogRef" @refresh="getTableData()" />
		<DetailsDialog ref="detailsDialogRef" @refresh="getTableData()" />
	</div>
</template>

<script setup lang="ts" name="student">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useStudentApi } from '/@/api/student';
import { useUserInfo } from '/@/stores/userInfo';
import { storeToRefs } from 'pinia';

// 引入组件
const UserDialog = defineAsyncComponent(() => import('/@/views/student/dialog.vue'));
const DetailsDialog = defineAsyncComponent(() => import('/@/views/student/details.vue'));

// 权限
// 定义变量内容
const stores = useUserInfo();
const { userInfos } = storeToRefs(stores);

// 定义变量内容
const userDialogRef = ref();
const detailsDialogRef = ref();
const state = reactive<StudentState>({
	tableData: {
		data: [],
		total: 0,
		loading: false,
		param: {
			search: '',
			pageNum: 1,
			pageSize: 10,
		},
	},
});

// 初始化表格数据
const getTableData = () => {
	state.tableData.loading = true;
	//const data = [];
	useStudentApi().getPage(state.tableData.param).then((res) => {
		ElMessage.success(res.message);
		state.tableData.total = Number(res.count)
		state.tableData.data = res.data
		//console.log(state)
	})
	setTimeout(() => {
		state.tableData.loading = false;
	}, 500);
};
// 打开详情弹窗
const onOpenDetails = (row: StudentType) => {
	detailsDialogRef.value.openDialog(row)
}
// 打开新增用户弹窗
const onOpenAddUser = (type: string) => {
	userDialogRef.value.openDialog(type);
};
// 打开修改用户弹窗
const onOpenEditUser = (type: string, row: StudentType) => {
	userDialogRef.value.openDialog(type, row);
};
// 删除用户
const onRowDel = (row: StudentType) => {
	ElMessageBox.confirm(`此操作将永久删除学生：“${row.name}”，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			useStudentApi().del(row.id).then((res) => {
				ElMessage.success(res.message);
				getTableData();
			})
			
		})
		.catch(() => {});
};
// 分页改变
const onHandleSizeChange = (val: number) => {
	state.tableData.param.pageSize = val;
	getTableData();
};
// 分页改变
const onHandleCurrentChange = (val: number) => {
	state.tableData.param.pageNum = val;
	getTableData();
};

// 获取随机颜色
const getColor = new Map([
	[1, 'primary'],
	[2, 'success'],
	[3, 'info'],
	[4, 'warning'],
	[5, 'danger'],
])
// 页面加载时
onMounted(() => {
	getTableData();
});
</script>

<style scoped lang="scss">
.system-user-container {
	:deep(.el-card__body) {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: auto;
		.el-table {
			flex: 1;
		}
	}
}
</style>
