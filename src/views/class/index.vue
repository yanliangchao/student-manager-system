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
				<el-button size="default" type="success" class="ml10" @click="onOpenAddUser('add')"  v-if="!userInfos.roles.includes('common')">
					<el-icon>
						<ele-FolderAdd />
					</el-icon>
					新增班级
				</el-button>
				<!-- <el-button size="default" type="warning" class="ml10" @click="onOpenAddSub()">
					<el-icon>
						<ele-FolderAdd />
					</el-icon>
					添加科目
				</el-button> -->
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
				<el-table-column type="index" label="序号" width="60" />
				<el-table-column prop="school_name" label="学校" show-overflow-tooltip></el-table-column>
				<el-table-column prop="class_id" label="班级号" show-overflow-tooltip></el-table-column>
				<el-table-column prop="class_name" label="班级名" show-overflow-tooltip></el-table-column>
				<el-table-column prop="subjects" label="主修科目" show-overflow-tooltip>
					<template #default="scope">
						<el-text class="mx-1" :type="getColor.get((k + 1)%5)" v-for="(v, k) in scope.row.subjects" :key="k" >
							{{ v.name.charAt(0) }}
							<span v-if="k < scope.row.subjects.length - 1"> | </span>
						</el-text>
					</template>
				</el-table-column>
				<el-table-column prop="name" label="班主任" show-overflow-tooltip></el-table-column>
				<el-table-column prop="tidCount" label="教师" show-overflow-tooltip>
					<template #default="scope">
						<el-button size="small" text type="primary" @click="getTeacherByCid(scope.row)" :disabled="Number(scope.row.tidCount) === -1">{{ scope.row.tidCount }}</el-button>
					</template>
				</el-table-column>
				<el-table-column prop="sidCount" label="学生" show-overflow-tooltip>
					<template #default="scope">
						<el-button size="small" text type="primary" @click="getStudentByCid(scope.row)" :disabled="Number(scope.row.sidCount) === -1">{{ scope.row.sidCount }}</el-button>
					</template>
				</el-table-column>
				
				<el-table-column label="操作" width="130">
					<template #default="scope">
						<el-button  size="small" text type="primary"
							>打印</el-button
						>
						<el-button  v-if="!userInfos.roles.includes('common')" size="small" text type="primary" @click="onOpenEditUser('edit', scope.row)"
							>修改</el-button
						>
						<el-button v-if="!userInfos.roles.includes('common')" size="small" text type="primary" @click="onRowDel(scope.row)">删除</el-button>
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
		<StuDialog ref="stuDialogRef"/>
		<TecDialog ref="tecDialogRef"/>
		
	</div>
</template>

<script setup lang="ts" name="class">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useClassApi } from '/@/api/class/index';
import { useUserInfo } from '/@/stores/userInfo';
import { storeToRefs } from 'pinia';

// 引入组件
const UserDialog = defineAsyncComponent(() => import('/@/views/class/dialog.vue'));
const StuDialog = defineAsyncComponent(() => import('/@/views/class/stuDetails.vue'));
const TecDialog = defineAsyncComponent(() => import('/@/views/class/tecDetails.vue'));


// 定义变量内容
const userDialogRef = ref();
const stuDialogRef = ref();
const tecDialogRef = ref();

// 权限
// 定义变量内容
const stores = useUserInfo();
const { userInfos } = storeToRefs(stores);

const state = reactive<ClassState>({
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
	useClassApi().getPage(state.tableData.param).then((res) => {
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
const onOpenAddUser = (type: string) => {
	userDialogRef.value.openDialog(type);
};
// 打开修改用户弹窗
const onOpenEditUser = (type: string, row: ClassType) => {
	userDialogRef.value.openDialog(type, row);
};

// 删除用户
const onRowDel = (row: ClassType) => {
	ElMessageBox.confirm(`此操作将永久删除班级：“${row.class_name}”，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			useClassApi().del(row.id).then((res) => {
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

// 获取学生并弹窗显示
const getStudentByCid = (row: ClassType) => {
	stuDialogRef.value.openDialog(row);
}

// 获取各科老师并弹窗显示
const getTeacherByCid = (row: ClassType) => {
	tecDialogRef.value.openDialog(row);
}

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
