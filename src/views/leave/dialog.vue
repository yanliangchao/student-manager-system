<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="769px">
			<el-form ref="classDialogFormRef" :rules="rules" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="学生" prop="sid" v-if="!state.dialog.selectd">
							<el-select v-model="state.ruleForm.sid" placeholder="请选择学生" filterable clearable class="w100">
								<el-option v-for="item in state.students" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
						<el-form-item label="老师" prop="tid" v-if="state.dialog.selectd">
							<el-select v-model="state.ruleForm.tid" placeholder="请选择老师" filterable clearable class="w100">
								<el-option v-for="item in state.teachers" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<!-- <el-form-item label="时间" prop="times">
							<el-date-picker v-model="state.ruleForm.times" type="datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DDTHH:mm:ss.000Z" placeholder="Select date and time"/>
						</el-form-item> -->
						<el-form-item label="时间" prop="times">
                            <el-date-picker v-model="state.ruleForm.times" type="datetimerange" range-separator="To" start-placeholder="Start date" format="YYYY-MM-DD HH:mm:ss" date-format="YYYY/MM/DD ddd" time-format="A hh:mm:ss" end-placeholder="End date" />
                        </el-form-item>
					</el-col>
					<!-- <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="违纪内容" prop="describes">
							<el-input v-model="state.ruleForm.describes" :rows="2" type="textarea" placeholder="请输入详细违纪内容" clearable></el-input>
						</el-form-item>
					</el-col> -->
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel(classDialogFormRef)" size="default">取 消</el-button>
					<el-button type="primary" @click="onSubmit(classDialogFormRef)" size="default" :loading="state.dialog.loading">{{ state.dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="classDialog">
import { reactive, ref, nextTick } from 'vue';
import { useStudentApi } from '/@/api/student';
import { useDetailsApi } from '/@/api/details';
import { useTeacherApi } from '/@/api/teacher';
import { ElMessage, FormRules, FormInstance } from 'element-plus';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const classDialogFormRef = ref();
const state = reactive({
	ruleForm: {
		describes: '',
		times: '',
		sid: null,
		tid: null,
	},
	students: [] as SelectOptionType[],
	teachers: [] as SelectOptionType[],
	dialog: {
		selectd: 0,
		loading: false,
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});

const rules = reactive<FormRules>({
	describes: [
		{ required: true, message: 'Please input describes', trigger: 'blur' },
	],
	times: [
		{ required: true, message: 'Please input times', trigger: 'blur' },
	],
	sid: [
		{ required: true, message: 'Please input student', trigger: 'blur' },
	],
	tid: [
		{ required: true, message: 'Please input teacher', trigger: 'blur' },
	],
})

// 打开弹窗
const openDialog = (type: string, selectd: number, row: any) => {
	//classDialogFormRef.value.resetFields();
	state.ruleForm = {
		describes: '',
		times: '',
		sid: null,
		tid: null,
	}
	state.dialog.type = type;
	state.dialog.isShowDialog = true;
	state.dialog.selectd = selectd;
	if (type === 'edit') {
		nextTick(() => {
			state.ruleForm = JSON.parse(JSON.stringify(row));
		});
		state.dialog.title = '修改违纪';
		state.dialog.submitTxt = '修 改';
	} else {
		state.dialog.title = '新增违纪';
		state.dialog.submitTxt = '新 增';
		// 清空表单，此项需加表单验证才能使用
		nextTick(() => {
			classDialogFormRef.value.resetFields();
		});
	}
	nextTick(() => {
		if(state.dialog.selectd) {
			state.teachers = [];
			getTeacherData();
		} else{
			state.students = [];
			getStudentData();
		}		
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
			if (state.dialog.type === 'add') { 
				useDetailsApi().addLeave(state.ruleForm).then((res) => {
					ElMessage.success(res.message);
					state.dialog.loading = false;
					closeDialog();
					emit('refresh');
				}).catch(() => {
					state.dialog.loading = false;
				})
			} else {
				useDetailsApi().mod(state.ruleForm).then((res) => {
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
// 获取学生下拉框
const getStudentData = () => {
	if(state.students.length > 0) return;
	useStudentApi().list().then((res) => {
		res.data.forEach((t: { id: number; name: string; }) => {
			state.students.push({
				label: t.name,
				value: t.id,
			})
		});
	})
}
// 获取老师下拉框
const getTeacherData = () => {
	if(state.teachers.length > 0) return;
	useTeacherApi().list().then((res) => {
		res.data.forEach((t: { id: number; teacher_name: string; }) => {
			state.teachers.push({
				label: t.teacher_name,
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
<style scoped>
.my-header {
  display: flex;
  flex-direction: row;
  /* justify-content: space-between; */
  gap: 16px;
}
</style>
