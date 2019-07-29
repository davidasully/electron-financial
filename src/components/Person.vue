<template>
    <div>{{user}}</div>
</template>

<script>
    export default {
        name: "Person",
        props: ['posid'],
        computed: {
            user() {
                let posid = this.posid.split('-');
                let uid = posid[0];
                let pid = posid[1];
                return this.$store.state.data.bpc.filter(item => {
                    return item.position_nbr === pid & item.emplid === uid
                })
            }
        }
    }
</script>

<style scoped>

</style>