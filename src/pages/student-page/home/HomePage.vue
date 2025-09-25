<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { ProgramService } from 'src/services/program'
import type { Program, ProgramItem } from 'src/types/program'
import type { PaginationResponse } from 'src/types/pagination'

const loading = ref(false)
const programs = ref<Program[]>([])

// find earliest upcoming datetime from a program's items
function getNextStartDateTime(p: Program): Date | null {
  const items: ProgramItem[] = Array.isArray(p.programItems) ? p.programItems : []
  const now = new Date()
  let best: Date | null = null
  for (const it of items) {
    const dates = Array.isArray(it.dates) ? it.dates : []
    for (const d of dates) {
      if (!d?.date || !d?.stime) continue
      const iso = `${d.date}T${d.stime}:00`
      const dt = new Date(iso)
      if (isNaN(dt.getTime())) continue
      if (dt >= now && (best === null || dt < best)) best = dt
    }
  }
  return best
}

const upcoming = computed(() => {
  const withDate = programs.value
    .map(p => ({ p, t: getNextStartDateTime(p) }))
    .filter(x => x.t !== null) as { p: Program; t: Date }[]

  withDate.sort((a, b) => a.t.getTime() - b.t.getTime())
  return withDate.slice(0, 5).map(x => ({ ...x.p, _next: x.t })) as (Program & { _next: Date })[]
})

const slide = ref(0)
const autoplay = ref(true)

function formatDate(dt?: Date) {
  if (!dt) return ''
  try {
    return dt.toLocaleString('th-TH', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
  } catch {
    return dt.toISOString()
  }
}

async function fetchUpcoming() {
  loading.value = true
  try {
    const res = await ProgramService.getAll({
      page: 1,
      limit: 50,
      sortBy: 'name',
      order: 'asc',
      search: '',
      skill: [],
      programState: ['open', 'close'],
      major: [],
      studentYear: [],
    } as any)
    const payload = (res as PaginationResponse<Program>).data || []
    programs.value = payload
  } finally {
    loading.value = false
  }
}

onMounted(fetchUpcoming)
</script>

<template>
  <q-page class="home-page">
    <div class="container">
      <div class="hero">
        <div class="hero__text">
          <h1>ข่าวสารและกิจกรรมใกล้เริ่ม</h1>
          <p>ติดตาม 5 กิจกรรมที่กำลังจะเริ่ม เราอัปเดตให้อัตโนมัติ</p>
        </div>
      </div>

      <q-card flat bordered class="carousel-card shadow-2">
        <q-inner-loading :showing="loading">
          <q-spinner color="primary" size="32px" />
        </q-inner-loading>

        <div v-if="!loading && !upcoming.length" class="empty">
          ยังไม่มีกิจกรรมที่กำลังจะเริ่ม
        </div>

        <q-carousel
          v-else
          v-model="slide"
          animated
          swipeable
          infinite
          :autoplay="autoplay ? 3000 : 0"
          transition-prev="slide-right"
          transition-next="slide-left"
          control-type="regular"
          arrows
          height="320px"
        >
          <q-carousel-slide
            v-for="(p, idx) in upcoming"
            :key="idx"
            :name="idx"
            class="slide"
          >
            <div class="slide__content">
              <div class="slide__cover" :style="{ backgroundImage: `url(${p.file || ''})` }"></div>
              <div class="slide__info">
                <div class="slide__pill">ใกล้เริ่ม</div>
                <h2 class="ellipsis" :title="p.name">{{ p.name }}</h2>
                <div class="slide__meta">
                  <q-icon name="event" size="18px" class="q-mr-xs" />
                  <span>{{ formatDate((p as any)._next) }}</span>
                </div>
                <div class="slide__tags">
                  <q-badge outline :color="p.skill === 'hard' ? 'primary' : 'secondary'">
                    {{ p.skill === 'hard' ? 'วิชาการ' : 'เตรียมความพร้อม' }}
                  </q-badge>
                  <q-badge v-if="p.programState" color="grey-7" outline class="q-ml-xs">
                    {{ p.programState }}
                  </q-badge>
                </div>
              </div>
            </div>
          </q-carousel-slide>
        </q-carousel>
      </q-card>
    </div>

    <footer class="footer">
      <div class="footer__inner">
        <div class="brand">Bluelock 007</div>
        <div class="links">
          <a href="#">ติดต่อ</a>
          <a href="#">เกี่ยวกับ</a>
          <a href="#">นโยบาย</a>
        </div>
      </div>
    </footer>
  </q-page>
</template>

<style scoped lang="scss">
.home-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
.container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;
}
.hero {
  background: linear-gradient(135deg, #e3f2fd 0%, #fff 100%);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}
.hero__text h1 {
  margin: 0 0 6px 0;
  font-size: 20px;
}
.hero__text p {
  margin: 0;
  color: #555;
}

.carousel-card {
  border-radius: 12px;
  overflow: hidden;
}
.empty {
  padding: 32px;
  text-align: center;
  color: #666;
}
.slide {
  display: flex;
  align-items: stretch;
  height: 100%;
}
.slide__content {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 180px auto;
  gap: 12px;
  width: 100%;
  height: 100%;
  padding: 12px;
}
.slide__cover {
  background: #f5f5f5 center/cover no-repeat;
  border-radius: 10px;
}
.slide__info {
  display: flex;
  flex-direction: column;
}
.slide__pill {
  align-self: flex-start;
  background: #ffecb3;
  color: #8a6d00;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  margin-bottom: 6px;
}
.slide__meta {
  display: flex;
  align-items: center;
  color: #333;
}
.slide__tags {
  margin-top: 6px;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ≥ sm
@media (min-width: 600px) {
  .slide__content {
    grid-template-columns: 2fr 3fr;
    grid-template-rows: 1fr;
  }
}

// ≥ md
@media (min-width: 1024px) {
  .hero__text h1 { font-size: 28px; }
  .slide__content { gap: 16px; padding: 16px; }
}

.footer {
  margin-top: auto;
  background: #0b1a37;
  color: #fff;
}
.footer__inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}
.footer a { color: #c9d6ff; text-decoration: none; margin-right: 12px; }
</style>
