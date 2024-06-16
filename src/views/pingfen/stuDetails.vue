<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="80%">
			<template #header="{ titleId, titleClass }">
                <div class="my-header">
                    <h4 :id="titleId" :class="titleClass">{{ state.dialog.title }}</h4>
                    <el-button type="primary" size="small" @click="onOpenAddStu()">加入学生</el-button>
                </div>
            </template>
            <el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column prop="name" label="姓名" show-overflow-tooltip></el-table-column>
				<el-table-column prop="gender" label="性别" show-overflow-tooltip>
					<template #default="scope">
						{{ Number(scope.row.gender) === 1 ? '女' : '男' }}
					</template>
				</el-table-column>
                <el-table-column prop="iphone" label="手机" show-overflow-tooltip></el-table-column>
                <el-table-column prop="address" label="地址" show-overflow-tooltip></el-table-column>
                <el-table-column prop="class_name" label="班级" show-overflow-tooltip></el-table-column>
				<el-table-column prop="number" label="床号" show-overflow-tooltip></el-table-column>
				<el-table-column prop="times" label="加入时间" width="150">
					<template #default="scope">
						{{ formatDate(scope.row.times) }}
					</template>
				</el-table-column>
				<el-table-column prop="owner" label="角色" show-overflow-tooltip>
					<template #default="scope">
						<el-button :disabled="scope.row.username === 'admin'" size="small" text type="success" @click="onSetOwner(scope.row)">{{ Number(scope.row.owner) === 0 ? '成员' : '寝室长' }}</el-button>
					</template>
				</el-table-column>
                <el-table-column prop="father" label="父亲" show-overflow-tooltip></el-table-column>
                <el-table-column prop="mother" label="母亲" show-overflow-tooltip></el-table-column>
                <el-table-column label="操作" width="80">
                    <template #default="scope">
                        <el-button :disabled="scope.row.username === 'admin'" size="small" text type="success" @click="onDeleteStu(scope.row)">移出</el-button>
                    </template>
                </el-table-column>
            </el-table>
		</el-dialog>
	</div>
	<AddStuDialog ref="addStuDialogRef" @refresh="getTableData()" />
</template>

<script setup lang="ts" name="classDialog">
import { reactive, ref, nextTick, defineAsyncComponent } from 'vue';
import { useDormitoryApi } from '/@/api/dormitory';
import { ElMessage, FormRules, FormInstance, ElMessageBox } from 'element-plus';

const AddStuDialog = defineAsyncComponent(() => import('/@/views/dormitory/addStuDialog.vue'));

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const addStuDialogRef = ref();
const state = reactive({
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
    dialog: {
		isShowDialog: false,
		title: '',
		data: {} as any,
	},
});

// 初始化表格数据
const getTableData = () => {
	state.tableData.loading = true;
	//const data = [];
	useDormitoryApi().getStuByid(state.dialog.data.id).then((res) => {
		ElMessage.success(res.message);
		state.tableData.total = Number(res.count)
		state.tableData.data = res.data
		//console.log(state)
	})
	setTimeout(() => {
		state.tableData.loading = false;
	}, 500);
};

// 打开弹窗
const openDialog = (row: DormitoryType) => {
	//classDialogFormRef.value.resetFields();
	console.log(row)
	state.dialog.isShowDialog = true;
	state.dialog.data = row
    state.dialog.title = `${row.school_name}-${row.building}-${row.name}寝室学生详情: (${row.sidCount})`;
	nextTick(() => {
		getTableData();
	})
	//getMenuData();
};

//打开新增学生弹窗
const onOpenAddStu = () => {

	if(state.dialog.data.number === Number(state.dialog.data.sidCount)) {
		ElMessage.warning("该寝室已住满!!!");
		return
	}
	addStuDialogRef.value.openDialog(state.dialog.data)
}

// 设置寝室长
const onSetOwner = (row: any) => {
	const title = Number(row.owner) === 0 ? `设置“${row.name}”为寝室长！` : `取消“${row.name}”的寝室长！`;
	ElMessageBox.confirm(title, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			row.owner = (Number(row.owner) + 1) % 2
			useDormitoryApi().modStu(row).then((res) => {
				ElMessage.success(res.message);
				getTableData();
			})
			
		})
		.catch(() => {});
}

// 删除寝室中的学生
const onDeleteStu = (row: any) => {
	ElMessageBox.confirm(`此操作将永久删除寝室人员：“${row.name}”，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			useDormitoryApi().delStu(row.id).then((res) => {
				ElMessage.success(res.message);
				getTableData();
				state.dialog.data.sidCount = state.dialog.data.sidCount - 1
				state.dialog.title = `${state.dialog.data.school_name}-${state.dialog.data.building}-${state.dialog.data.name}寝室学生详情: (${state.dialog.data.sidCount})`;
			})
			
		})
		.catch(() => {});
}

//格式化时间
const formatDate = (date: any) => {
	const localDate = new Date(date);
	return localDate.toLocaleString(); // 使用浏览器的本地时间格式
}

// 暴露变量
defineExpose({
	openDialog,
});
</script>
<style scoped>
.my-header {
  display: flex;
  flex-direction: row;
  /* justify-content: space-between; */
  gap: 16px;
}
</style>
