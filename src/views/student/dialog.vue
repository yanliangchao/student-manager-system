<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" :close-on-click-modal='false' width="769px">
			<el-form ref="classDialogFormRef" :rules="rules" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35" v-if="state.dialog.all">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-upload
							class="upload-demo"
							:limit="1"
							accept=".xlsx, .xls"
							drag
							action="http://localhost:3021/api/auth/files"
							multiple
							:auto-upload="true"
      						:before-upload="beforeUpload"
						>
							<el-icon class="el-icon--upload"><upload-filled /></el-icon>
							<div class="el-upload__text">
							Drop file here or <em>click to upload</em>
							</div>
							<!-- <template #tip>
							<div class="el-upload__tip">
								jpg/png files with a size less than 500kb
							</div>
							</template> -->
						</el-upload>
					</el-col>
				</el-row>
				<el-row :gutter="35" v-else>
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
						<el-form-item label="性别" prop="gender">
							<el-select v-model="state.ruleForm.gender" placeholder="请选择性别" filterable clearable class="w100">
								<el-option key="0" label="男" value="0" />
								<el-option key="1" label="女" value="1" />
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
import { useClassApi } from '/@/api/class';
import { useStudentApi } from '/@/api/student';
import { ElMessage, FormRules, FormInstance } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue'
import XLSX from "xlsx";

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
		gender: null,
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
	allStudent: {},
	classs: [] as SelectOptionType[],
	//dormitorys: [] as SelectOptionType[],
	dialog: {
		loading: false,
		isShowDialog: false,
		all: false,
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
	gender: [
		{ required: true, message: 'Please select gender', trigger: 'blur' },
	],
})

// 打开弹窗
const openDialog = (type: string, row: StudentType) => {
	//classDialogFormRef.value.resetFields();
	state.dialog.type = type;
	state.dialog.isShowDialog = true;
	state.dialog.all = false;
	if (type === 'all') {
		state.dialog.all = true;
		state.dialog.title = '导入学生';
		state.dialog.submitTxt = '提 交';
	} else if (type === 'edit') {
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
		state.classs = [];
		//state.dormitorys = [];
		//getDormitoryData();
		getClassData();
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

//上传文件之前的钩子
const beforeUpload = (file: any) => {
	console.log(file)
	//解析excel
	analysisExcel(file).then((tableJson: any) => {
		if (tableJson && tableJson.length > 0) {
			//成功解析出数据
			//只取第一个sheet的数据
			let dataExcel = tableJson[0];
			console.log("数据", dataExcel);
			console.log(JSON.stringify(dataExcel.sheet));
			state.allStudent = JSON.stringify(dataExcel.sheet)
		}
	});
}
    //解析excel
function analysisExcel(file: any) {
	return new Promise(function (resolve, reject) {
		const reader = new FileReader();
		reader.onload = function (e: any) {
			const data = e.target.result;
			let datajson = XLSX.read(data, {
				type: "binary",
			});
			const result = [] as any;
			datajson.SheetNames.forEach((sheetName) => {
			result.push({
				sheetName: sheetName,
				sheet: XLSX.utils.sheet_to_json(datajson.Sheets[sheetName]),
			});
			});
			resolve(result);
		};
		reader.readAsBinaryString(file);
	});
}
// 提交
const onSubmit = (formEl: FormInstance | undefined) => {
	state.dialog.loading = true;
	if (!formEl) return
	formEl.validate((valid, fields) => {
		if (valid) {
			if (state.dialog.type === 'all') { 
				useStudentApi().addAll(state.allStudent).then((res) => {
					ElMessage.success(res.message);
					state.dialog.loading = false;
					closeDialog();
					emit('refresh');
				}).catch(() => {
					state.dialog.loading = false;
				})
			} else if (state.dialog.type === 'add') { 
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
