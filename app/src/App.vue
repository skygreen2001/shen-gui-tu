<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("App Launch");
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style>
page {
  background-color: #F8F6F2;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
  font-size: 30rpx;
  color: #2D2D2D;
  line-height: 1.6;
}
</style>
