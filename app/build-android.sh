#!/bin/bash
# ShenGuiTu Android 构建脚本
# 使用方法：./build-android.sh [debug|release]

set -e

# 设置环境变量
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
export ANDROID_HOME=$HOME/Library/Android/sdk

# 项目根目录
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANDROID_DIR="$PROJECT_DIR/android"

# 构建类型
BUILD_TYPE=${1:-debug}

echo "========================================"
echo "  ShenGuiTu Android 构建"
echo "  构建类型: $BUILD_TYPE"
echo "========================================"
echo ""

# 进入 Android 目录
cd "$ANDROID_DIR"

# 使用系统 Gradle 构建
echo "开始构建..."
/Users/pupu/Tools/gradle-9.4.1/bin/gradle app:assemble$BUILD_TYPE -x lint --no-daemon

echo ""
echo "========================================"
echo "  构建完成!"
echo "  APK 位置:"
echo "  $ANDROID_DIR/app/build/outputs/apk/$BUILD_TYPE/"
echo "========================================"
