<template>
	<div class="system-user-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto">
			<div class="system-user-search mb15">
				<el-input v-model="state.tableData.param.search" size="default" placeholder="请输入用户名称" style="max-width: 180px"> </el-input>
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
					新增用户
				</el-button>
			</div>
			<el-row :gutter="35">
				<el-col :xs="12" :sm="16" :md="16" :lg="16" :xl="16" class="mb20">
					<el-table :data="state.tableData.data" v-loading="state.tableData.loading" highlight-current-row  @current-change="handleCurrentChange" style="width: 100%">
						<el-table-column type="index" label="序号" width="60" />
						<el-table-column prop="username" label="用户名" show-overflow-tooltip></el-table-column>
						<el-table-column label="操作" width="100">
							<template #default="scope">
								<el-button :disabled="scope.row.username === 'admin'" size="small" text type="primary" @click="onOpenEditUser('edit', scope.row)"
									>修改</el-button
								>
								<el-button :disabled="scope.row.username === 'admin'" size="small" text type="primary" @click="onRowDel(scope.row)">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-col>
				<el-col :xs="12" :sm="8" :md="8" :lg="8" :xl="8" class="mb20">
					<el-form ref="userDialogFormRef" :model="state.ruleForm" size="small" label-position="top" label-width="90px">
						<div class="selectRole">
							<h4>学校权限</h4>
							<el-button type="primary" size="small" :disabled="state.tableData.disabled" @click="onChangeRoles()">保存修改</el-button>
						</div>
						<el-form-item>
							<el-checkbox-group v-model="state.ruleForm.sids">
								<div v-for="(v, k) in state.tableData.schoolData" :key="k">
									<el-checkbox :value="v.id" :label="v.school_name" />
								</div>
							</el-checkbox-group>
						</el-form-item>
					</el-form>
					
				</el-col>
			</el-row>
			
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

<script setup lang="ts" name="systemUser">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useUserApi } from '/@/api/user';
import { useSchoolApi } from '/@/api/school';

// 引入组件
const UserDialog = defineAsyncComponent(() => import('/@/views/system/user/dialog.vue'));

// 定义变量内容
const userDialogRef = ref();
const state = reactive<SysUserState>({
	tableData: {
		data: [],
		total: 0,
		loading: false,
		disabled: true,
		schoolData: [],
		param: {
			search: '',
			pageNum: 1,
			pageSize: 10,
		},
	},
	ruleForm: {
		uid: 0,
		sids: [],
	}
});

// 初始化表格数据
const getTableData = () => {
	state.tableData.loading = true;
	useUserApi().getPage(state.tableData.param).then((res) => {
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
const onOpenEditUser = (type: string, row: RowUserType) => {
	userDialogRef.value.openDialog(type, row);
};
// 删除用户
const onRowDel = (row: RowUserType) => {
	ElMessageBox.confirm(`此操作将永久删除账户名称：“${row.username}”，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			useUserApi().del(row.id).then((res) => {
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
// 获取全部学校
const getSchoolData = () => (
	useSchoolApi().list().then((res) => {
		state.tableData.schoolData = res.data;
	})
)
// 选择用户行
const handleCurrentChange = (val: RowUserType) => {
  state.ruleForm.sids = [];
  state.ruleForm.uid = val?.id;
  state.tableData.disabled = false;
  val?.sids.forEach((sid: {sid: number}) => state.ruleForm.sids.push(sid.sid))
}

// 保存修改的权限
const onChangeRoles = () => {
	useUserApi().modRole(state.ruleForm).then((res) => {
		ElMessage.success(res.message);
		getTableData();
	})
}

// 页面加载时
onMounted(() => {
	getTableData();
	getSchoolData();
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
.selectRole {
	padding: 8px;
	align-items: center;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	gap: 16px;
}
</style>
