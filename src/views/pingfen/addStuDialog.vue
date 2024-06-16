<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" :close-on-click-modal='false' width="769px">
			<el-form ref="dormitoryDialogFormRef" :rules="rules" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="床号" prop="number">
							<el-input v-model="state.ruleForm.number" placeholder="请输入床号" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="时间" prop="times">
							<el-date-picker v-model="state.ruleForm.times" type="datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DDTHH:mm:ss.000Z" placeholder="Select date and time" class="w100"/>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="学生" prop="sid">
							<el-select v-model="state.ruleForm.sid" placeholder="请选择学生" filterable clearable class="w100">
								<el-option v-for="item in state.students" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="角色" prop="sid">
							<el-select v-model="state.ruleForm.owner" placeholder="请选择角色" filterable clearable class="w100">
								<el-option key="0" label="成员" value="0" />
								<el-option key="1" label="寝室长" value="1" />
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
import { useStudentApi } from '/@/api/student';
import { useDormitoryApi } from '/@/api/dormitory';
import { ElMessage, FormRules, FormInstance } from 'element-plus';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const dormitoryDialogFormRef = ref();
const state = reactive({
	ruleForm: {
		times: null,
		number: '',
		did: null,
		//name: '',
		owner: '',
		sid: '',
	},
	students: [] as SelectOptionType[],
	dialog: {
		loading: false,
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
		data: {} as any,
	},
});

const rules = reactive<FormRules>({
	times: [
		{ required: true, message: 'Please input times', trigger: 'blur' },
	],
	number: [
		{ required: true, message: 'Please input number', trigger: 'blur' },
	],
	owner: [
		{ required: true, message: 'Please select role', trigger: 'blur' },
	],
	sid: [
		{ required: true, message: 'Please input student name', trigger: 'blur' },
	],
})

// 打开弹窗
const openDialog = (row: DormitoryType) => {
	//dormitoryDialogFormRef.value.resetFields();
	state.dialog.isShowDialog = true;
	state.dialog.data = row;
	state.dialog.title = '加入学生';
	state.dialog.submitTxt = '加 入';
		// 清空表单，此项需加表单验证才能使用
		nextTick(() => {
			dormitoryDialogFormRef.value.resetFields();
		});
	
	nextTick(() => {
		state.students = [];
		getStudentData();
	})
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
	state.dialog.loading = true;
	if (!formEl) return
	formEl.validate((valid, fields) => {
		if (valid) {
			state.ruleForm.did = state.dialog.data.id;
			useDormitoryApi().addStu(state.ruleForm).then((res) => {
				ElMessage.success(res.message);
				state.dialog.loading = false;
				closeDialog();
				emit('refresh');
			}).catch(() => {
				state.dialog.loading = false;
			})
		} else {
			state.dialog.loading = false;
		}
	})
	
};

// 获取学生下拉框
const getStudentData = () => {
	if(state.students.length > 0) return;
	useStudentApi().listByDormitory(state.dialog.data.gender).then((res) => {
		res.data.forEach((t: { id: number; name: string; }) => {
			state.students.push({
				label: t.name,
				value: t.id,
			})
		});
	})
}

// 暴露变量
defineExpose({
	openDialog,
});
</script>
