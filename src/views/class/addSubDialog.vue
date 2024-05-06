<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="769px">
			<el-form ref="classDialogFormRef" :rules="rules" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
                    <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="科目" prop="sid">
							<el-select v-model="state.ruleForm.sid" placeholder="请选择科目" filterable clearable class="w100">
								<el-option v-for="item in state.subjects" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="教师" prop="tid">
							<el-select v-model="state.ruleForm.tid" placeholder="请选择任课老师" filterable clearable class="w100">
								<el-option v-for="item in state.teachers" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="主修" prop="master">
							<el-switch v-model="state.ruleForm.master" inline-prompt active-text="是" :active-value="1" inactive-text="否" :inactive-value="0"/>
						</el-form-item>
					</el-col>
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
import { useSubjectApi } from '/@/api/subject';
import { useTeacherApi } from '/@/api/teacher';
import { useClassApi } from '/@/api/class';
import { ElMessage, FormRules, FormInstance } from 'element-plus';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const classDialogFormRef = ref();
const state = reactive({
	ruleForm: {
        cid: null,
		tid: null,
		//name: '',
		sid: null,
		master: 0,
		//school_name: '', // 账户名称
		// userNickname: '', // 用户昵称
		// roleSign: '', // 关联角色
		// department: [] as string[], // 部门
		// phone: '', // 手机号
		// email: '', // 邮箱
		// sex: '', // 性别
		// password: '', // 账户密码
		// overdueTime: '', // 账户过期
		// status: true, // 用户状态
		// describe: '', // 用户描述
	},
	subjects: [] as SelectOptionType[],
	teachers: [] as SelectOptionType[],
	dialog: {
		loading: false,
		isShowDialog: false,
        data: {} as any,
		title: '',
		submitTxt: '',
	},
});

const rules = reactive<FormRules<ClassType>>({
	tid: [
		{ required: true, message: 'Please input class name', trigger: 'blur' },
	],
	sid: [
		{ required: true, message: 'Please input school name', trigger: 'blur' },
	],
})

// 打开弹窗
const openDialog = (row: ClassType) => {
	//classDialogFormRef.value.resetFields();
	state.dialog.isShowDialog = true;
    state.dialog.data = row;
    state.dialog.title = `${row.class_name}绑定老师及科目`;
    state.dialog.submitTxt = '绑 定';
    // 清空表单，此项需加表单验证才能使用
    nextTick(() => {
        classDialogFormRef.value.resetFields();
    });
	
	nextTick(() => {
		state.teachers = [];
		getTeacherData();
        state.subjects = [];
		getSubjectData();
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
            state.ruleForm.cid = state.dialog.data.id
            useClassApi().addSubTec(state.ruleForm).then((res) => {
                ElMessage.success(res.message);
                state.dialog.loading = false;
                closeDialog();
                emit('refresh');
				//state.dialog.data.tidCount = state.dialog.data.tidCount + 1
            }).catch(() => {
                state.dialog.loading = false;
            })

		} else {
			state.dialog.loading = false;
		}
	})
	
};

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

// 获取科目下拉框
const getSubjectData = () => {
	if(state.subjects.length > 0) return;
	useSubjectApi().list().then((res) => {
		res.data.forEach((s: { id: number; name: string; }) => {
			state.subjects.push({
				label: s.name,
				value: s.id,
			})
		});
	})
}

// 暴露变量
defineExpose({
	openDialog,
});
</script>
