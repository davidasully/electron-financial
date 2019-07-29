<template>
    <div></div>
</template>

<script>
    import $ from 'jquery';
    import 'jquery-ui'
    require('jquery-ui/ui/widgets/sortable');
    import 'pivottable'
    import 'pivottable/dist/pivot.css'

    export default {
        name: "Pivot",
        props: ['props'],
        mounted() {
            let data = this.props.data;
            let rows = this.props.rows;
            let cols = this.props.cols;
            let vals = this.props.vals;
            let aggNm = this.props.aggNm;
            let rendNm = this.props.rendNm;
            $(this.$el).pivotUI(
                data, {
                    rows: rows,
                    cols: cols,
                    vals: vals,
                    aggregatorName: aggNm,
                    rendererName: rendNm
                }
            );
        },
        beforeDestroy() {
            $(this.$el).hide().remove();
        }
    }
</script>

<style scoped>

</style>