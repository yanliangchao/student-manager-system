<template>
	<div class="system-user-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto">
			<div class="system-user-search mb15">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8" class="mb20">
						<el-input v-model="state.tableData.param.search" size="default" placeholder="请输入寝室信息" style="max-width: 200px"> </el-input>
						<el-button size="default" type="primary" class="ml10" @click="getTableData()">
							<el-icon>
								<ele-Search />
							</el-icon>
							查询
						</el-button>
					</el-col>
					<!-- <el-col :xs="12" :sm="24" :md="6" :lg="4" :xl="4" class="mb20">
						<el-button size="default" type="success" @click="onOpenAddUser('add')" v-if="!userInfos.roles.includes('common')">
							<el-icon>
								<ele-FolderAdd />
							</el-icon>
							新增寝室
						</el-button>
					</el-col>
					<el-col :xs="12" :sm="24" :md="6" :lg="4" :xl="4" class="mb20">
						<el-button size="default" type="warning" @click="getStoreyPingfen()" v-if="!userInfos.roles.includes('common')">
							<el-icon>
								<ele-FolderAdd />
							</el-icon>
							楼层评分
						</el-button>
					</el-col> -->
				</el-row>	
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%" size="small">
				<template v-if="screenWidth">
					<el-table-column type="index" label="序号" width="60" />
					<el-table-column prop="school_name" label="学校" show-overflow-tooltip></el-table-column>
					<el-table-column prop="building" label="楼栋" show-overflow-tooltip></el-table-column>
					<el-table-column prop="storey" label="楼层" show-overflow-tooltip></el-table-column>
					<el-table-column prop="gender" label="性别" show-overflow-tooltip>
						<template #default="scope">
							{{ scope.row.gender == 1 ? '女寝' : '男寝' }}
						</template>
					</el-table-column>
					<el-table-column prop="name" label="寝室号" show-overflow-tooltip></el-table-column>
					<el-table-column prop="ttc_name" label="管理教师" show-overflow-tooltip>
						<template #default="scope">
							<el-text class="mx-1" :type="getColor.get((k + 1)%5)" v-for="(v, k) in scope.row.manager" :key="k" >
								{{ v.name }}
								<span v-if="k < scope.row.manager.length - 1"> | </span>
							</el-text>
						</template>
					</el-table-column>
					<el-table-column prop="number" label="床位" show-overflow-tooltip></el-table-column>
					<el-table-column prop="sidCount" label="学生" show-overflow-tooltip>
						<template #default="scope">
							<el-button size="small" text type="primary" @click="getStudentByDid(scope.row)" :disabled="Number(scope.row.sidCount) === -1">{{ scope.row.sidCount }}</el-button>
						</template>
					</el-table-column>
				</template>
				<template v-else >
					<el-table-column prop="class" label="寝室信息" show-overflow-tooltip>
						<template #default="scope">
							{{ scope.row.building }}-{{ scope.row.storey }}-{{ scope.row.name }} | {{ scope.row.gender == 1 ? '女寝' : '男寝' }}
						</template>
					</el-table-column>
				</template>
				<el-table-column label="操作" width="170">
					<template #default="scope">
						<el-button :disabled="scope.row.username === 'admin'" size="small" text type="primary" @click="getManager(scope.row)"
							>评分</el-button
						>
						<!-- <el-button :disabled="scope.row.username === 'admin'" size="small" text type="primary" @click="getPrint(scope.row)"
							>打印</el-button
						>
						<el-button v-if="!userInfos.roles.includes('common')" size="small" text type="primary" @click="onOpenEditUser('edit', scope.row)"
							>修改</el-button
						>
						<el-button v-if="!userInfos.roles.includes('common')" size="small" text type="primary" @click="onRowDel(scope.row)">删除</el-button> -->
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
		<MgDialog ref="mgDialogRef"/>
		<PingfenDialog ref="pingfenDialog"/>
		<PersonalDialog ref="personalDialog" />

	</div>
</template>

<script setup lang="ts" name="class">
import { defineAsyncComponent, reactive, onMounted, ref, onUnmounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useDormitoryApi } from '/@/api/dormitory';
import { useUserInfo } from '/@/stores/userInfo';
import { storeToRefs } from 'pinia';

// 引入组件
const UserDialog = defineAsyncComponent(() => import('/@/views/pingfen/dialog.vue'));
const StuDialog = defineAsyncComponent(() => import('/@/views/pingfen/stuDetails.vue'));
const MgDialog = defineAsyncComponent(() => import('/@/views/pingfen/mgDetails.vue'));
const PingfenDialog = defineAsyncComponent(() => import('/@/views/pingfen/pingfenDetails.vue'));
const PersonalDialog = defineAsyncComponent(() => import('/@/views/pingfen/personalDetails.vue'));

// 权限
// 定义变量内容
const stores = useUserInfo();
const { userInfos } = storeToRefs(stores);

// 定义变量内容
const userDialogRef = ref();
const stuDialogRef = ref();
const mgDialogRef = ref();
const pingfenDialog = ref();
const personalDialog = ref();

const screenWidth  = ref(true);
const state = reactive<DormitoryState>({
	tableData: {
		data: [],
		total: 0,
		loading: false,
		param: {
			search: '',
			pageNum: 1,
			pageSize: 10,
		},
	}
});

// 初始化表格数据
const getTableData = () => {
	state.tableData.loading = true;
	//const data = [];
	useDormitoryApi().getPage(state.tableData.param).then((res) => {
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
const onOpenEditUser = (type: string, row: DormitoryType) => {
	userDialogRef.value.openDialog(type, row);
};

// 删除用户
const onRowDel = (row: DormitoryType) => {
	ElMessageBox.confirm(`此操作将永久删除寝室：“${row.building} - ${row.name}”，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			useDormitoryApi().del(row.id).then((res) => {
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
const getStudentByDid = (row: DormitoryType) => {
	stuDialogRef.value.openDialog(row);
}

// 打印弹窗
const getPrint = (row: DormitoryType) => {
	personalDialog.value.openDialog(row);
}

// 获取评分弹窗显示
const getStoreyPingfen = () => {
	pingfenDialog.value.openDialog();
}

// 获取管理弹窗显示
const getManager= (row: ClassType) => {
	mgDialogRef.value.openDialog(row);
}

// 获取随机颜色
const getColor = new Map([
	[1, 'primary'],
	[2, 'success'],
	[3, 'info'],
	[4, 'warning'],
	[5, 'danger'],
])

// h获取屏幕宽度
const handleResize = () => {
  	screenWidth.value = window.innerWidth > 1200 ? true: false;
}

// 页面加载时
onMounted(() => {
	window.addEventListener('resize', handleResize);
	getTableData();
	handleResize();
});
onUnmounted(() => {
	window.removeEventListener('resize', handleResize);
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
