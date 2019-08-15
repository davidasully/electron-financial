<template>
    <div></div>
</template>

<script>
    export default {
        name: "Reload",
        created() {
            this.$router.push('/');
            setTimeout(() => {
                location.reload(true)
            }, 100)
        }
    }
</script>

<style scoped>


</style>