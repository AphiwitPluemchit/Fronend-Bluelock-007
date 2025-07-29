<template>
  <q-page class="forms-list-page">
    <div class="container">
      <!-- Header -->
      <div class="page-header q-mb-lg">
        <h1 class="page-title">Available Forms</h1>
        <p class="page-subtitle">Select a form to fill out</p>
      </div>


    </div>
  </q-page>
</template>

<script setup lang="ts">


</script>

<style scoped>
.forms-list-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
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

.forms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.form-card {
  transition: all 0.2s ease;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.form-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.form-title {
  font-size: 18px;
  font-weight: 600;
  color: #202124;
  margin: 0;
  flex: 1;
  margin-right: 12px;
}

.form-description {
  font-size: 14px;
  color: #5f6368;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.form-meta {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #80868b;
}

.form-date {
  margin-left: 4px;
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
  margin: 0;
  max-width: 400px;
}

.pagination-container {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .container {
    padding: 16px;
  }

  .forms-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .form-card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-title {
    margin-right: 0;
    margin-bottom: 8px;
  }
}
</style>
