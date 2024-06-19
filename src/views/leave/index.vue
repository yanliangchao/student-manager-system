<template>
	<div class="system-user-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto">
			<div class="system-user-search mb15">
				<!-- <el-radio-group v-model="state.tableData.selectd" size="default" @change="selectedType()">
					<el-radio-button :value="0">学生</el-radio-button>
					<el-radio-button :value="1">老师</el-radio-button>
				</el-radio-group> -->
				<el-input v-model="state.tableData.param.search" class="ml10" size="default" placeholder="请输入查询条件" style="max-width: 180px"> </el-input>
				<el-button size="default" type="primary" class="ml10" @click="getTableData()">
					<el-icon>
						<ele-Search />
					</el-icon>
					查询
				</el-button>
				<el-button size="default" type="success" class="ml10" @click="onOpenAddUser('add', state.tableData.selectd)">
					<el-icon>
						<ele-FolderAdd />
					</el-icon>
					新增请假
				</el-button>
			</div>
			<el-table v-if="!state.tableData.selectd" :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
				<el-table-column type="index" label="序号" width="60" />
				<el-table-column prop="name" label="学生" show-overflow-tooltip></el-table-column>
				<el-table-column prop="gender" label="性别" show-overflow-tooltip>
					<template #default="scope">
						{{ scope.row.gender == 1 ? '女' : '男' }}
					</template>
				</el-table-column>
				<el-table-column prop="school_name" label="学校" show-overflow-tooltip></el-table-column>
				<el-table-column prop="class_name" label="班级" show-overflow-tooltip></el-table-column>
				<el-table-column prop="dormitory_name" label="寝室" show-overflow-tooltip>
					<template #default="scope">
						{{ scope.row.building }} - {{  scope.row.storey }} - {{  scope.row.dormitory_name }} | {{  scope.row.dormitory_gender == 1 ? '女寝' : '男寝'  }} | {{  scope.row.number }}
					</template>
				</el-table-column>
				<el-table-column prop="times" label="开始时间" show-overflow-tooltip>
					<template #default="scope">
						{{ formatDate(scope.row.start_time) }}
					</template>
				</el-table-column>
				<el-table-column prop="times" label="结束时间" show-overflow-tooltip>
					<template #default="scope">
						{{ formatDate(scope.row.end_time) }}
					</template>
				</el-table-column>
				<!-- <el-table-column prop="describes" label="违纪" show-overflow-tooltip></el-table-column>
				<el-table-column prop="scope" label="扣分" show-overflow-tooltip></el-table-column> -->
				<el-table-column prop="username" label="操作人" show-overflow-tooltip></el-table-column>
				<el-table-column label="操作" width="100">
					<template #default="scope">
						<!-- <el-button :disabled="scope.row.username === 'admin'" size="small" text type="primary" @click="onOpenEditUser('edit', state.tableData.selectd, scope.row)"
							>修改</el-button
						> -->
						<el-button :disabled="scope.row.username === 'admin'" size="small" text type="primary" @click="onRowDel(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-table v-if="state.tableData.selectd" :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
				<el-table-column type="index" label="序号" width="60" />
				<el-table-column prop="name" label="老师" show-overflow-tooltip></el-table-column>
				<el-table-column prop="school_name" label="学校" show-overflow-tooltip></el-table-column>
				<el-table-column prop="times" label="时间" show-overflow-tooltip>
					<template #default="scope">
						{{ formatDate(scope.row.times) }}
					</template>
				</el-table-column>
				<el-table-column prop="describes" label="违纪" show-overflow-tooltip></el-table-column>
				<el-table-column label="操作" width="100">
					<template #default="scope">
						<!-- <el-button :disabled="scope.row.username === 'admin'" size="small" text type="primary" @click="onOpenEditUser('edit', state.tableData.selectd, scope.row)"
							>修改</el-button
						> -->
						<el-button :disabled="scope.row.username === 'admin'" size="small" text type="primary" @click="onRowDel(scope.row)">删除</el-button>
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

<script setup lang="ts" name="class">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useDetailsApi } from '/@/api/details';

// 引入组件
const UserDialog = defineAsyncComponent(() => import('/@/views/leave/dialog.vue'));

// 定义变量内容
const userDialogRef = ref();
const state = reactive({
	tableData: {
		data: [],
		total: 0,
		loading: false,
		selectd: 0,
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
	state.tableData.data = [];
	useDetailsApi().getLeave(state.tableData.param).then((res) => {
		ElMessage.success(res.message);
		state.tableData.total = Number(res.count)
		state.tableData.data = res.data
		//console.log(state)
	})
	setTimeout(() => {
		state.tableData.loading = false;
	}, 500);
};
// 打开新增用户弹窗
const onOpenAddUser = (type: string, selectd: number) => {
	userDialogRef.value.openDialog(type, selectd);
};
// 打开修改用户弹窗
const onOpenEditUser = (type: string, selectd: number, row: any) => {
	userDialogRef.value.openDialog(type, selectd, row);
};
// 删除用户
const onRowDel = (row: any) => {
	ElMessageBox.confirm(`此操作将永久删除违纪记录，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			useDetailsApi().del(row.id).then((res) => {
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
//格式化时间
const formatDate = (date: any) => {
	const localDate = new Date(date);
	return localDate.toLocaleString(); // 使用浏览器的本地时间格式
}
const selectedType = () => {
	getTableData();
}

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
.el-radio-group {
	font-size: var(--el-font-size-base);
}
</style>
