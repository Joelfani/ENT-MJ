<template>
    <div class="modal fade" :id="id" tabindex="-1" role="dialog" aria-labelledby="form_add" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal_container_pop" role="document">
            <div class="modal-content">
                <div class="common_container modal_container">
                    <section class="common_section">
                        <div class="text-center">
                            <h3 class="section_name">{{ title }}</h3>
                            <p v-if = "mini_title" class="section_name" style="font-size: 1rem;">{{ mini_title }}</p>
                        </div>
                        <hr />
                        <div class="info">
                            <slot></slot>
                        </div>
                        
                    </section>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        id: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        mini_title: {
            type: String,
            default: ''
        }
    }
}
</script>