<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
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
      const isDirectory = this.isObjectId(key)
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
    isObjectId(id) {
      return /^[0-9a-fA-F]{24}$/.test(id)
    },
    async activeEdition() {
      if (this.isActive) {
        return
      }
      try {
        await this.setActive(this.selectedEdition._id)
      } catch (error) {
        console.log(error)
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
        console.log(error)
      }
    },
  },
}
</script>

<template>
  <div>
    <AppButton
      outlined
      variant="success"
      :disabled="isActive"
      @click="activeEdition"
      >Сделать активной</AppButton
    >
    <AppButton outlined variant="primary" @click="clone"
      >Клонировать {{ isSame ? '' : '*' }}</AppButton
    >
    <AppButton outlined variant="danger" @click="removeHandler"
      >Удалить</AppButton
    >
  </div>
</template>

<style></style>
