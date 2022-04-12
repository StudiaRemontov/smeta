<script>
import ContentBody from '@/components/Layout/ContentBody.vue'
import EditionTable from '@/components/PriceLists/EditionTable.vue'
import { mapActions } from 'vuex'

export default {
  components: { EditionTable, ContentBody },
  props: {
    priceList: Object,
    edition: Object,
  },
  methods: {
    ...mapActions('edition', ['remove']),
    async removeHandler() {
      try {
        await this.remove(this.edition._id)
        this.$router.push('/pricelists')
      } catch (error) {
        console.log(error)
      }
    },
  },
}
</script>

<template>
  <ContentBody>
    <template #header>
      <div class="header">
        <span>
          {{ edition.name }}
        </span>
        <AppButton outlined variant="danger" @click="removeHandler"
          >Удалить</AppButton
        >
      </div>
    </template>
    <template #content>
      <EditionTable :edition="edition" />
    </template>
  </ContentBody>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
