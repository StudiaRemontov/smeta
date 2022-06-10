<script>
import { mapActions } from 'vuex'
export default {
  data() {
    return {
      name: '',
    }
  },
  computed: {
    parent() {
      return this.$route.params?.id
    },
  },
  mounted() {
    this.$refs.input.focus()
  },
  methods: {
    ...mapActions('directory', ['createDirectory']),
    async create() {
      if (!this.name) {
        return this.$emit('created')
      }

      const data = {
        name: this.name,
        parent: this.parent,
      }
      try {
        await this.createDirectory(data)
        this.name = ''
        this.$emit('created')
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
  <li class="directory-item">
    <input
      v-model="name"
      @keyup.enter="create"
      placeholder="Введите название паки"
      @blur="create"
      ref="input"
      class="directory-item__input"
    />
  </li>
</template>

<style lang="scss" scoped>
.directory-item {
  cursor: pointer;
  border: 1px solid #a7a7a7;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 15px 15px;

  &__header {
    display: flex;
    justify-content: space-between;
  }

  &__input {
    max-width: 100%;
    width: 100%;
    font-size: $font-medium;
    font-weight: 700;

    &:disabled {
      pointer-events: all;
      background-color: transparent;
      color: #000;
      cursor: pointer;
    }
  }
}
</style>
