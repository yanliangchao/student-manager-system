<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" :close-on-click-modal='false' width="769px">
			<el-form ref="dormitoryDialogFormRef" :rules="rules" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="楼栋" prop="building">
							<el-input v-model="state.ruleForm.building" placeholder="请输入楼栋" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="楼层" prop="storey">
							<el-input v-model="state.ruleForm.storey" placeholder="请输入楼层" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="寝室号" prop="name">
							<el-input v-model="state.ruleForm.name" placeholder="请输入寝室号" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="床位" prop="number">
							<el-input type="number" v-model="state.ruleForm.number" placeholder="请输入床位数量" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="性别" prop="gender">
							<el-select v-model="state.ruleForm.gender" placeholder="请选择性别" filterable clearable class="w100">
								<el-option key="0" label="男寝" :value="0" />
								<el-option key="1" label="女寝" :value="1" />
							</el-select>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel(dormitoryDialogFormRef)" size="default">取 消</el-button>
					<el-button type="primary" @click="onSubmit(dormitoryDialogFormRef)" size="default" :loading="state.dialog.loading">{{ state.dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="classDialog">
import { reactive, ref, nextTick } from 'vue';
import { useDormitoryApi } from '/@/api/dormitory';
import { ElMessage, FormRules, FormInstance } from 'element-plus';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const dormitoryDialogFormRef = ref();
const state = reactive({
	ruleForm: {
		building: '',
		name: '',
		tid: null,
		storey: '',
		gender: '',
		number: '',
		//name: '',
	},
	schools: [] as SelectOptionType[],
	teachers: [] as SelectOptionType[],
	dialog: {
		loading: false,
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});

const rules = reactive<FormRules<DormitoryType>>({
	building: [
		{ required: true, message: 'Please input building', trigger: 'blur' },
	],
	name: [
		{ required: true, message: 'Please input name', trigger: 'blur' },
	],
	number: [
		{ required: true, message: 'Please input name', trigger: 'blur' },
	],
	storey: [
		{ required: true, message: 'Please input storey', trigger: 'blur' },
	],
	gender: [
		{ required: true, message: 'Please input storey', trigger: 'blur' },
	],
})

// 打开弹窗
const openDialog = (type: string, row: DormitoryType) => {
	//dormitoryDialogFormRef.value.resetFields();
	state.dialog.type = type;
	state.dialog.isShowDialog = true;
	if (type === 'edit') {
		nextTick(() => {
			state.ruleForm = JSON.parse(JSON.stringify(row));
		});
		state.dialog.title = '修改寝室';
		state.dialog.submitTxt = '修 改';
	} else {
		state.dialog.title = '新增寝室';
		state.dialog.submitTxt = '新 增';
		// 清空表单，此项需加表单验证才能使用
		nextTick(() => {
			dormitoryDialogFormRef.value.resetFields();
		});
	}
	//getMenuData();
};
// 关闭弹窗
const closeDialog = () => {
	state.dialog.isShowDialog = false;
};
// 取消
const onCancel = (formEl: FormInstance | undefined) => {
	if (!formEl) return
  	formEl.resetFields()
	closeDialog();
};
// 提交
const onSubmit = (formEl: FormInstance | undefined) => {
	if (!formEl) return
	state.dialog.loading = true;
	formEl.validate((valid, fields) => {
		if (valid) {
			if (state.dialog.type === 'add') { 
				useDormitoryApi().add(state.ruleForm).then((res) => {
					ElMessage.success(res.message);
					state.dialog.loading = false;
					closeDialog();
					emit('refresh');
				}).catch(() => {
					state.dialog.loading = false;
				})
			} else {
				useDormitoryApi().mod(state.ruleForm).then((res) => {
					ElMessage.success(res.message);
					state.dialog.loading = false;
					closeDialog();
					emit('refresh');
				}).catch(() => {
					state.dialog.loading = false;
				})
			}
		} else {
			state.dialog.loading = false;
		}
	})
	
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>
