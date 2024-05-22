<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" :close-on-click-modal='false' width="769px">
			<el-form ref="schoolDialogFormRef" :rules="rules" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="姓名" prop="name">
							<el-input v-model="state.ruleForm.name" placeholder="请输入姓名" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="手机号" prop="iphone">
							<el-input v-model="state.ruleForm.iphone" placeholder="请输入手机号" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="级别" prop="level">
							<el-input v-model="state.ruleForm.level" placeholder="请输入手机号" clearable></el-input>
						</el-form-item>
					</el-col>
					<!-- <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="所教科目" prop="subjects">
							<el-select v-model="state.ruleForm.subjects" placeholder="请选择所教科目" multiple filterable clearable class="w100">
								<el-option v-for="item in state.subjects" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col> -->
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel" size="default">取 消</el-button>
					<el-button type="primary" @click="onSubmit" size="default" :loading="state.dialog.loading">{{ state.dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="schoolDialog">
import { reactive, ref, nextTick } from 'vue';
import { useSchoolApi } from '/@/api/school';
import { useTeacherApi } from '/@/api/teacher';
import { ElMessage, FormRules } from 'element-plus';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const schoolDialogFormRef = ref();
const state = reactive({
	ruleForm: {
		name: '', 
		iphone: '',
		level: '',
		sid: null
	},
	disabled: false,
	schools: [] as SelectOptionType[],
	dialog: {
		loading: false,
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});

const rules = reactive<FormRules<TeacherType>>({
	name: [
		{ required: true, message: 'Please input name', trigger: 'blur' },
	],
	sid: [
		{ required: true, message: 'Please input school name', trigger: 'blur' },
	],
})

// 打开弹窗
const openDialog = (type: string, row: TeacherType) => {
	//schoolDialogFormRef.value.resetFields();
	state.dialog.type = type;
	state.dialog.isShowDialog = true;
	if (type === 'edit') {
		nextTick(() => {
			state.ruleForm = JSON.parse(JSON.stringify(row));
			// state.ruleForm.subjects = []
			// row.subjects.forEach((s: any) => state.ruleForm.subjects.push(s.id))
		});
		state.dialog.title = '修改老师';
		state.dialog.submitTxt = '修 改';
	} else {
		state.dialog.title = '新增老师';
		state.dialog.submitTxt = '新 增';
		// 清空表单，此项需加表单验证才能使用
		nextTick(() => {
			schoolDialogFormRef.value.resetFields();
		});
	}
	
	//getMenuData();
};
// 关闭弹窗
const closeDialog = () => {
	state.dialog.isShowDialog = false;
};
// 取消
const onCancel = () => {
	closeDialog();
};
// 提交
const onSubmit = () => {
	state.dialog.loading = true;
	if (state.dialog.type === 'add') { 
		useTeacherApi().add(state.ruleForm).then((res) => {
			ElMessage.success(res.message);
			state.dialog.loading = false;
			closeDialog();
			emit('refresh');
		}).catch(() => {
			state.dialog.loading = false;
		})
	} else {
		useTeacherApi().mod(state.ruleForm).then((res) => {
			ElMessage.success(res.message);
			state.dialog.loading = false;
			closeDialog();
			emit('refresh');
		}).catch(() => {
			state.dialog.loading = false;
		})
	}
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>
