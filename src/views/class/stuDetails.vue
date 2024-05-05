<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="80%">
            <el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column prop="name" label="姓名" show-overflow-tooltip></el-table-column>
                <el-table-column prop="iphone" label="手机" show-overflow-tooltip></el-table-column>
                <el-table-column prop="address" label="地址" show-overflow-tooltip></el-table-column>
                <el-table-column prop="dormitory_name" label="寝室" show-overflow-tooltip>
                    <template #default="scope">
                        {{ scope.row.building }} - {{  scope.row.dormitory_name }}
                    </template>
                </el-table-column>
                <el-table-column prop="number" label="床号" show-overflow-tooltip></el-table-column>
                <el-table-column prop="father" label="父亲" show-overflow-tooltip></el-table-column>
                <el-table-column prop="mother" label="母亲" show-overflow-tooltip></el-table-column>
                <!-- <el-table-column label="操作" width="150">
                    <template #default="scope">
                        <el-button :disabled="scope.row.username === 'admin'" size="small" text type="success" @click="onOpenDetails(scope.row)"
                            >违纪</el-button
                        >
                    </template>
                </el-table-column> -->
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
		</el-dialog>
        <DetailsDialog ref="detailsDialogRef"/>
	</div>
</template>

<script setup lang="ts" name="classDialog">
import { reactive, ref, nextTick, defineAsyncComponent } from 'vue';
import { useStudentApi } from '/@/api/student';
import { ElMessage, FormRules, FormInstance } from 'element-plus';

const DetailsDialog = defineAsyncComponent(() => import('/@/views/student/details.vue'));

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const detailsDialogRef = ref();

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
	useStudentApi().getPageByCid(state.dialog.data.id, state.tableData.param).then((res) => {
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
const openDialog = (row: ClassType) => {
	//classDialogFormRef.value.resetFields();
	state.dialog.isShowDialog = true;
    state.dialog.data = row
    state.dialog.title = `${row.school_name}-${row.class_name}学生详情(${row.sidCount})`;
	nextTick(() => {
		getTableData();
	})
	//getMenuData();
};
// 打开详情弹窗
const onOpenDetails = (row: StudentType) => {
	detailsDialogRef.value.openDialog(row)
}

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

// 暴露变量
defineExpose({
	openDialog,
});
</script>
