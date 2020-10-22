<template>
  <div class="home">
 
    <section>
            <input type="text" id="address" v-model="address" />

    </section>
  </div>
</template>

<script>
export default {
  name: "Home",
  components: {},
  data() {
    return {
      address:"",
    };
  },
  mounted(){
    this.init()
  },
   methods:{
    init(){
      
    }
  },
};
</script>
