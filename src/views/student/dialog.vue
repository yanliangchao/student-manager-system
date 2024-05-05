<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" :close-on-click-modal='false' width="769px">
			<el-form ref="classDialogFormRef" :rules="rules" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="姓名" prop="name">
							<el-input v-model="state.ruleForm.name" placeholder="请输入姓名" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="手机" prop="iphone">
							<el-input v-model="state.ruleForm.iphone" placeholder="请输入手机号" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="学校" prop="sid">
							<el-select v-model="state.ruleForm.sid" placeholder="请选择学校" filterable clearable class="w100">
								<el-option v-for="item in state.schools" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="班级" prop="cid">
							<el-select v-model="state.ruleForm.cid" placeholder="请选择班级" filterable clearable class="w100">
								<el-option v-for="item in state.classs" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="父亲" prop="father">
							<el-input v-model="state.ruleForm.father" placeholder="请输入父亲姓名" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="父亲手机" prop="father_iphone">
							<el-input v-model="state.ruleForm.father_iphone" placeholder="请输入父亲手机号" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="母亲" prop="mother">
							<el-input v-model="state.ruleForm.mother" placeholder="请输入母亲姓名" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="母亲手机" prop="mother_iphone">
							<el-input v-model="state.ruleForm.mother_iphone" placeholder="请输入母亲手机号" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="地址" prop="address">
							<el-input v-model="state.ruleForm.address" :rows="2" type="textarea" placeholder="请输入详细地址" clearable></el-input>
						</el-form-item>
					</el-col>
					<!-- <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="寝室" prop="did">
							<el-select v-model="state.ruleForm.did" placeholder="请选择寝室" filterable clearable class="w100">
								<el-option v-for="item in state.dormitorys" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
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
import { useSchoolApi } from '/@/api/school';
import { useDormitoryApi } from '/@/api/dormitory';
import { useClassApi } from '/@/api/class';
import { useStudentApi } from '/@/api/student';
import { ElMessage, FormRules, FormInstance } from 'element-plus';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const classDialogFormRef = ref();
const state = reactive({
	ruleForm: {
		name: '',
		iphone: '',
		address: '',
		father: '',
		father_iphone: '',
		mother: '',
		mother_iphone: '',
		cid: null,
		did: null,
		sid: null,
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
	schools: [] as SelectOptionType[],
	classs: [] as SelectOptionType[],
	//dormitorys: [] as SelectOptionType[],
	dialog: {
		loading: false,
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});

const rules = reactive<FormRules<StudentType>>({
	name: [
		{ required: true, message: 'Please input name', trigger: 'blur' },
	],
	iphone: [
		{ required: true, message: 'Please input iphone', trigger: 'blur' },
	],
	sid: [
		{ required: true, message: 'Please input school', trigger: 'blur' },
	],
})

// 打开弹窗
const openDialog = (type: string, row: StudentType) => {
	//classDialogFormRef.value.resetFields();
	state.dialog.type = type;
	state.dialog.isShowDialog = true;
	if (type === 'edit') {
		nextTick(() => {
			state.ruleForm = JSON.parse(JSON.stringify(row));
		});
		state.dialog.title = '修改学生';
		state.dialog.submitTxt = '修 改';
	} else {
		state.dialog.title = '新增学生';
		state.dialog.submitTxt = '新 增';
		// 清空表单，此项需加表单验证才能使用
		nextTick(() => {
			classDialogFormRef.value.resetFields();
		});
	}
	nextTick(() => {
		state.schools = [];
		state.classs = [];
		//state.dormitorys = [];
		//getDormitoryData();
		getClassData();
		getSchoolData();
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
				useStudentApi().add(state.ruleForm).then((res) => {
					ElMessage.success(res.message);
					state.dialog.loading = false;
					closeDialog();
					emit('refresh');
				}).catch(() => {
					state.dialog.loading = false;
				})
			} else {
				useStudentApi().mod(state.ruleForm).then((res) => {
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
// 获取学校下拉框
const getSchoolData = () => {
	if(state.schools.length > 0) return;
	useSchoolApi().list().then((res) => {
		res.data.forEach((s: { id: number; school_name: string; }) => {
			state.schools.push({
				label: s.school_name,
				value: s.id,
			})
		});
	})
}
// 获取班级下拉框
const getClassData = () => {
	if(state.classs.length > 0) return;
	useClassApi().list().then((res) => {
		res.data.forEach((t: { id: number; class_name: string; }) => {
			state.classs.push({
				label: t.class_name,
				value: t.id,
			})
		});
	})
}
// 获取寝室下拉框
// const getDormitoryData = () => {
// 	if(state.dormitorys.length > 0) return;
// 	useDormitoryApi().list().then((res) => {
// 		res.data.forEach((t: { id: number; building:string, name: string; }) => {
// 			state.dormitorys.push({
// 				label: t.building + ' - ' + t.name,
// 				value: t.id,
// 			})
// 		});
// 	})
// }

// 暴露变量
defineExpose({
	openDialog,
});
</script>
