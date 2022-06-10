<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'

import ConfirmModal from '@/components/PriceLists/Clone/ConfirmClone.vue'

import { isObjectId } from '@/helpers/isObjectId'

export default {
  components: { ConfirmModal },
  computed: {
    ...mapGetters('edition', [
      'active',
      'selectedEdition',
      'clonedDirectories',
    ]),
    tree() {
      if (!this.selectedEdition) return []
      const { data } = this.selectedEdition
      return [data]
    },
    isSame() {
      if (!this.selectedEdition) {
        return false
      }
      const isExists = !!this.clonedDirectories.find(
        d => d._id === this.selectedEdition.dirId,
      )
      const isSame = !![this.selectedEdition.data].find(this.isSameNode)

      return isExists && isSame
    },
    isActive() {
      return this.selectedEdition?._id === this.active?._id
    },
  },
  methods: {
    ...mapMutations('edition', ['setClone']),
    ...mapActions('edition', ['remove', 'setActive']),
    isSameNode(node, directory) {
      const { children, key } = node
      const isDirectory = isObjectId(key)
      if (isDirectory) {
        const directory = this.clonedDirectories.find(d => d._id === node.key)
        if (!directory) {
          return false
        }
        return children.every(c => this.isSameNode(c, directory))
      }
      const { values } = directory
      return !!values.find(v => v.id === key)
    },
    async activeEdition() {
      if (this.isActive) {
        return
      }
      try {
        await this.setActive(this.selectedEdition._id)
      } catch (error) {
        const { response } = error
        const message = response ? response.data.message : error.message
        this.$toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: message,
          life: 3000,
        })
      }
    },
    async clone() {
      if (!this.isSame) {
        const response = await this.$refs['confirm-modal'].show({
          title: 'Применить изменения',
          okButton: 'Да',
          cancelButton: 'Нет',
        })
        if (response) {
          return this.setClone({
            value: this.tree,
            mergeType: 'rightJoin',
          })
        }
      }
      this.setClone({
        value: this.tree,
        mergeType: 'full',
      })
    },
    async removeHandler() {
      try {
        await this.remove(this.selectedEdition._id)
      } catch (error) {
        const { response } = error
        const message = response ? response.data.message : error.message
        this.$toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: message,
          life: 3000,
        })
      }
    },
  },
}
</script>

<template>
  <div>
    <ConfirmModal ref="confirm-modal" />

    <AppButton outlined @click="activeEdition">
      {{ isActive ? 'Активная редакция' : 'Сделать активной' }}
    </AppButton>
    <AppButton outlined variant="primary" @click="clone">
      Клонировать {{ isSame ? '' : '*' }}
    </AppButton>
    <AppButton outlined variant="danger" @click="removeHandler">
      Удалить
    </AppButton>
  </div>
</template>

<style></style>
