<style>
  .simple-maker {
    padding: 20px;
  }
</style>
<template>
  <div class="simple-maker">
    <h2 class="simple-maker-title">
      Simple Maker
    </h2>
    <el-form label-position="top">
      <el-form-item label="SVG 文件">
        <el-upload drag multiple
                   :auto-upload="false"
                   :on-change="onFileChange"
                   action=""
                   accept=".svg"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
      </el-form-item>

      <el-form-item label="输出目录">
        <el-input v-model="outputDir" icon="edit"
                  :onIconClick="selectOutputDir"
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :disabled="!fileList.length || !outputDir" @click="make">生成 iconfont</el-button>
      </el-form-item>

    </el-form>
  </div>
</template>

<script>
	export default {
		data () {
			return {
				ipc: null,
				fileList: [],
				outputDir: ''
			}
		},

		computed: {},

		methods: {
			make () {
				let maker = require('iconfont-maker')
				console.log('Starting...')
				maker({
					files: this.fileList,
          dest: this.outputDir
				}, _ => {
					this.$alert('生成成功！', '提示')
        })
			},

			onFileChange (file, fileList) {
				this.fileList = fileList.map(file => {
					return file.raw.path
				})
			},

			selectOutputDir () {
				this.$electron.ipcRenderer.send('open-destination-dialog')
			}
		},

		mounted () {
			this.ipc = this.$electron.ipcRenderer
			this.ipc.on('selected-directory', (event, path) => {
				this.outputDir = path[0]
			})
		},

		beforeDestroy () {
			this.ipc.removeAllListeners('selected-directory')
      this.ipc = null
		}
	}
</script>
