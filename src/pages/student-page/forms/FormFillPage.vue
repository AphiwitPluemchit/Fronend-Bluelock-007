<template>
<div>
  da
</div>
</template>
<script setup lang="ts">

</script>

<style scoped>
.form-fill-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.error-container {
  margin: 20px 0;
}

.form-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 32px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.form-title-section {
  flex: 1;
}

.form-title {
  font-size: 28px;
  font-weight: 600;
  color: #202124;
  margin: 0 0 8px 0;
}

.form-description {
  font-size: 16px;
  color: #5f6368;
  margin: 0;
  line-height: 1.5;
}

.form-meta {
  margin-left: 24px;
}

.progress-section {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-text {
  font-size: 14px;
  color: #5f6368;
}

.progress-percentage {
  font-size: 14px;
  font-weight: 600;
  color: #202124;
}

.questions-section {
  margin-bottom: 32px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.not-found-title {
  font-size: 24px;
  font-weight: 500;
  color: #5f6368;
  margin: 16px 0 8px 0;
}

.not-found-description {
  font-size: 16px;
  color: #80868b;
  margin: 0 0 24px 0;
  max-width: 400px;
}

.confirmation-dialog {
  min-width: 400px;
}

@media (max-width: 768px) {
  .container {
    padding: 16px;
  }

  .form-content {
    padding: 20px;
  }

  .form-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-meta {
    margin-left: 0;
    margin-top: 16px;
  }

  .form-title {
    font-size: 24px;
  }

  .form-actions {
    flex-direction: column;
    gap: 12px;
  }

  .form-actions .q-btn {
    width: 100%;
  }
}
</style>
