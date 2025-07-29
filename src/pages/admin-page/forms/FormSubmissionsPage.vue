<template>
  <div>
    dad
  </div>
</template>

<script setup lang="ts">


</script>

<style scoped>
.form-submissions-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.header-content {
  flex: 1;
}

.breadcrumb {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #5f6368;
}

.breadcrumb-text {
  margin-left: 8px;
  font-weight: 500;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #202124;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #5f6368;
  margin: 0;
}

.header-actions {
  margin-left: 24px;
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

.stats-section {
  margin-bottom: 24px;
}

.stats-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #4285f4;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #5f6368;
}

.submission-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.submission-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.submission-title {
  font-size: 18px;
  font-weight: 600;
  color: #202124;
  margin: 0 0 4px 0;
}

.submission-date {
  font-size: 14px;
  color: #5f6368;
  margin: 0;
}

.answers-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.answer-preview-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.answer-label {
  font-weight: 500;
  color: #5f6368;
  min-width: 120px;
}

.answer-value {
  color: #202124;
  flex: 1;
}

.more-answers {
  font-size: 12px;
  color: #80868b;
  font-style: italic;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-title {
  font-size: 24px;
  font-weight: 500;
  color: #5f6368;
  margin: 16px 0 8px 0;
}

.empty-description {
  font-size: 16px;
  color: #80868b;
  margin: 0 0 24px 0;
  max-width: 400px;
}

.pagination-container {
  display: flex;
  justify-content: center;
}

.submission-dialog {
  background-color: #f8f9fa;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

.dialog-title {
  font-size: 24px;
  font-weight: 600;
  color: #202124;
  margin: 0;
}

.dialog-content {
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
}

.submission-details {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 32px;
}

.detail-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.detail-header h3 {
  font-size: 24px;
  font-weight: 600;
  color: #202124;
  margin: 0 0 8px 0;
}

.detail-date {
  font-size: 16px;
  color: #5f6368;
  margin: 0;
}

.answers-section h4 {
  font-size: 20px;
  font-weight: 600;
  color: #202124;
  margin: 0 0 24px 0;
}

.answer-detail-item {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.answer-detail-item:last-child {
  border-bottom: none;
}

.question-text {
  font-size: 16px;
  font-weight: 500;
  color: #202124;
  margin-bottom: 12px;
}

.answer-content {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
}

.text-answer {
  font-size: 14px;
  color: #202124;
  line-height: 1.5;
}

.array-answer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.object-answer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.grid-answer-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.grid-key {
  font-weight: 500;
  color: #5f6368;
  min-width: 100px;
}

.grid-value {
  flex: 1;
}

@media (max-width: 768px) {
  .container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-actions {
    margin-left: 0;
    width: 100%;
  }

  .page-title {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .submission-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .answer-preview-item {
    flex-direction: column;
    gap: 4px;
  }

  .answer-label {
    min-width: auto;
  }

  .dialog-content {
    padding: 16px;
  }

  .submission-details {
    padding: 20px;
  }
}
</style>
