<template>
  <div class="home">
    <section>
      <div> 
        Metamask loaded address: 
        <input type="text" id="address" v-model="address" style="width:100%"/>
      </div>
      <br/>
      <div>
        <span>Nonce: {{nonce}}</span>
      </div>
    </section>
  </div>
</template>

<script>
import Web3 from "web3";
import MetaTransactions from "../assets/MetaTransactions.json";

export default {
  name: "Home",
  components: {},
  data() {
    return {
      address: "",
      nonce: 0,
      metacontract: "",
    };
  },
  async mounted() {
    await this.init();
  },
  methods: {
    async init() {
      window.ethereum.enable().catch((error) => {
        console.log("error ethereum", error);
      });
      this.web3 = new Web3(window.ethereum);

      // this.contract = new this.web3.eth.contract(MetaTransactions)


      this.web3.eth.getAccounts().then((_accounts) => {
        this.address = _accounts[0];
      });
  
      // this.nonce = await contract.methods.getNonce(this.address).call();

    },
  },
};
</script>
