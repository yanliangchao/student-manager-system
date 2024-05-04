<template>
	<div class="system-user-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto">
			<div class="system-user-search mb15">
				<el-input v-model="state.tableData.param.search" size="default" placeholder="请输入学校名称" style="max-width: 180px"> </el-input>
				<el-button size="default" type="primary" class="ml10" @click="getTableData()">
					<el-icon>
						<ele-Search />
					</el-icon>
					查询
				</el-button>
				<el-button size="default" type="success" class="ml10" @click="onOpenAddUser('add')">
					<el-icon>
						<ele-FolderAdd />
					</el-icon>
					新增老师
				</el-button>
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
				<el-table-column type="index" label="序号" width="60" />
				<el-table-column prop="name" label="老师名" show-overflow-tooltip></el-table-column>
				<el-table-column prop="iphone" label="手机号" show-overflow-tooltip></el-table-column>
				<el-table-column prop="level" label="级别" show-overflow-tooltip></el-table-column>
				<el-table-column prop="school_name" label="学校名" show-overflow-tooltip></el-table-column>
				<el-table-column prop="class_teacher" label="所带班级" show-overflow-tooltip>
					<template #default="scope">
						<el-tag type="success" v-for="(v, k) in scope.row.class_teacher" :key="k">{{ v.class_name }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="subjects" label="所教科目" show-overflow-tooltip>
					<template #default="scope">
						<el-tag v-for="(v, k) in scope.row.subjects" :key="k">{{ v.name }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="100">
					<template #default="scope">
						<el-button :disabled="scope.row.userName === 'admin'" size="small" text type="primary" @click="onOpenEditUser('edit', scope.row)"
							>修改</el-button
						>
						<el-button :disabled="scope.row.userName === 'admin'" size="small" text type="primary" @click="onRowDel(scope.row)">删除</el-button>
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
	</div>
</template>

<script setup lang="ts" name="teacher">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useTeacherApi } from '/@/api/teacher';

// 引入组件
const UserDialog = defineAsyncComponent(() => import('/@/views/teacher/dialog.vue'));

// 定义变量内容
const userDialogRef = ref();
const state = reactive<TeacherState>({
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
	useTeacherApi().getPage(state.tableData.param).then((res) => {
		ElMessage.success(res.message);
		state.tableData.total = Number(res.count)
		state.tableData.data = res.data
	})
	setTimeout(() => {
		state.tableData.loading = false;
	}, 500);
};
// 打开新增用户弹窗
const onOpenAddUser = (type: string) => {
	userDialogRef.value.openDialog(type);
};
// 打开修改用户弹窗
const onOpenEditUser = (type: string, row: SchoolType) => {
	userDialogRef.value.openDialog(type, row);
};
// 删除用户
const onRowDel = (row: SchoolType) => {
	ElMessageBox.confirm(`此操作将永久删除账户名称：“${row.school_name}”，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			useTeacherApi().del(row.id).then((res) => {
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
