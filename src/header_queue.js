import { Desktop } from "@wxcc-desktop/sdk";


const template = document.createElement("template");

template.innerHTML = `
  <style>
    .value {
    display: inline-block;
    padding: .2rem .5rem;
    border-radius: .35rem;
    font-weight: 600;
    background: #f3f4f6; /* neutrale Fläche */
  }

  .value.is-zero   { color: #16a34a; } /* grün  */
  .value.lt-2      { color: #f59e0b; } /* orange */
  .value.gt-2      { color: #dc2626; } /* rot    */
  </style>

  <div id="rss-widget">
        connecting...
      </div>
`;

const logger = Desktop.logger.createLogger("header_queue");

class header_queue extends HTMLElement {
  constructor(){
    super();
    logger.info("header_queue", "started");
    this.attachShadow({mode:"open"});
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.$field = this.shadowRoot.getElementById("rss-widget");
    const datacenter = this.datacenter;
    logger.info("header_queue", "datacenter" +datacenter);
    this.baseUrl = this.getAttribute("base-url") || "https://api.wxcc-eu1.cisco.com/search";
    this.timer = null;
    this.auto = true;
  }
  connectedCallback(){
    Desktop.config.init();
    this.start();
  }
  disconnectedCallback(){
    clearInterval(this.timer);
    Desktop.agentContact.removeAllEventListeners();
  }
  start(){
    this.refresh(false);
    this.timer = setInterval(() => { if(this.auto) this.refresh(false); }, 3000);
  }
  async getToken(){
    const actoken = await Desktop.actions.getToken();
    //logger.info("header_queue", "getToken" +actoken);
    // Versuche Token aus dem Desktop SDK zu holen, fallback auf bottoken-Konstante
    try{
      const t = Desktop?.config?.auth?.accessToken || Desktop?.auth?.accessToken;
      if (t) return t;
    }catch(_){}
    return actoken;
  }
  buildUrl(){
    const u = new URL(this.baseUrl);
    //logger.info("header_queue", "Base URL" +u.toString());
    return u.toString();
  }
  async fetchHistory(){
    const token = await this.getToken();

    //logger.info("header_queue", "fetch history Token clean" +token);
    const orgid = this.organizationId;
    //logger.info("header_queue", "fetch history Org" + orgid);
    const tt = "Bearer "+token;
    //logger.info("header_queue", "fetch history Token " +tt);
    const start = Date.now() - (12 * 60 * 60 * 1000);

    const ende = Date.now();

    //logger.info("header_queue", start +". " +ende);
    const query = `{
    #TOTAL CALLS BY Queue and Average Handle Time by Queue
  
    task(
      from: `+start +` #This can be set to Date.now() - (days * 24 * 60 * 60 * 1000) for look back in days
      to:   `+ende +` #This can be set to Date.now() in ms
          timeComparator: createdTime
    filter: {
      and: [
        { direction: { equals: "inbound" } }
        { isActive: { equals: true } }
        { status: { equals: "parked" } }
        { channelType: { equals: telephony } }
      ]
    }
    aggregations: {
      field: "id"
      type: count
      name: "Total Queued Contacts RealTime"
    }
  ) {
    tasks {
      aggregation {
        name
        value
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`;

    //logger.info("header_queue", JSON.parse('{"query":"{    #TOTAL CALLS BY Queue and Average Handle Time by Queue      task(      from: 1761725515000 #This can be set to Date.now() - (days * 24 * 60 * 60 * 1000) for look back in days      to:   1761728615000 #This can be set to Date.now() in ms          timeComparator: createdTime    filter: {      and: [        { direction: { equals: \"inbound\" } }        { isActive: { equals: true } }        { status: { equals: \"parked\" } }        { channelType: { equals: telephony } }      ]    }    aggregations: {      field: \"id\"      type: count      name: \"Total Queued Contacts RealTime\"    }  ) {    tasks {      aggregation {        name        value      }    }    pageInfo {      hasNextPage      endCursor    }  }}","variables":{}}'),);
    const res = await fetch(this.buildUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": tt
      },
      // Automatically converted to "username=example&password=password"
      //body: '{"query":"{\n    #TOTAL CALLS BY Queue and Average Handle Time by Queue\n  \n    task(\n      from: 1761725515000 #This can be set to Date.now() - (days * 24 * 60 * 60 * 1000) for look back in days\n      to:   1761728615000 #This can be set to Date.now() in ms\n          timeComparator: createdTime\n    filter: {\n      and: [\n        { direction: { equals: \"inbound\" } }\n        { isActive: { equals: true } }\n        { status: { equals: \"parked\" } }\n        { channelType: { equals: telephony } }\n      ]\n    }\n    aggregations: {\n      field: \"id\"\n      type: count\n      name: \"Total Queued Contacts RealTime\"\n    }\n  ) {\n    tasks {\n      aggregation {\n        name\n        value\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}","variables":{}}'
          body: JSON.stringify({
            query: query
          })
          // …
        });
      const data = await res.json();
      logger.info("header_queue", data);
    return data;
  }


  async fetchqueuecalls(){
    const token = await this.getToken();

    //logger.info("header_queue", "fetch history Token clean" +token);
    const orgid = this.organizationId;
    //logger.info("header_queue", "fetch history Org" + orgid);
    const tt = "Bearer "+token;
    //logger.info("header_queue", "fetch history Token " +tt);
    const start = Date.now() - (12 * 60 * 60 * 1000);

    const ende = Date.now();

    //logger.info("header_queue", start +". " +ende);
    const query = `{
				#TOTAL CALLS BY Entry Point
		
				task(
					from: `+start +` #This can be set to Date.now() - (days * 24 * 60 * 60 * 1000) for look back in days
					to: `+ende +` #This can be set to Date.now() in ms
					timeComparator: createdTime
					filter: {
						and: [
							{ direction: { equals: "inbound" } }
							{ channelType: { equals: telephony } }
						]
					}
					aggregations: {
						field: "id"
						type: count
						name: "Total Contacts by Entry Point"
					}
				) {
					tasks {
						lastEntryPoint {
							name
							id
						}
						aggregation {
							name
							value
						}
					}
					pageInfo {
						hasNextPage
						endCursor
					}
				}
			}`;

    //logger.info("header_queue", JSON.parse('{"query":"{    #TOTAL CALLS BY Queue and Average Handle Time by Queue      task(      from: 1761725515000 #This can be set to Date.now() - (days * 24 * 60 * 60 * 1000) for look back in days      to:   1761728615000 #This can be set to Date.now() in ms          timeComparator: createdTime    filter: {      and: [        { direction: { equals: \"inbound\" } }        { isActive: { equals: true } }        { status: { equals: \"parked\" } }        { channelType: { equals: telephony } }      ]    }    aggregations: {      field: \"id\"      type: count      name: \"Total Queued Contacts RealTime\"    }  ) {    tasks {      aggregation {        name        value      }    }    pageInfo {      hasNextPage      endCursor    }  }}","variables":{}}'),);
    const res = await fetch(this.buildUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": tt
      },
      // Automatically converted to "username=example&password=password"
      //body: '{"query":"{\n    #TOTAL CALLS BY Queue and Average Handle Time by Queue\n  \n    task(\n      from: 1761725515000 #This can be set to Date.now() - (days * 24 * 60 * 60 * 1000) for look back in days\n      to:   1761728615000 #This can be set to Date.now() in ms\n          timeComparator: createdTime\n    filter: {\n      and: [\n        { direction: { equals: \"inbound\" } }\n        { isActive: { equals: true } }\n        { status: { equals: \"parked\" } }\n        { channelType: { equals: telephony } }\n      ]\n    }\n    aggregations: {\n      field: \"id\"\n      type: count\n      name: \"Total Queued Contacts RealTime\"\n    }\n  ) {\n    tasks {\n      aggregation {\n        name\n        value\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}","variables":{}}'
          body: JSON.stringify({
            query: query
          })
          // …
        });
      const data = await res.json();
      logger.info("header_queue", data);
    return data;
  }

  clearTable(){ this.$field.innerHTML = ``; }
  render(items, queuedata){
    this.clearTable();
    logger.error("header_queue", items);
    logger.error("header_queue", items.data.task.tasks[0].aggregation[0].name);
    logger.error("header_queue", items.data.task.tasks[0].aggregation[0].value);
    logger.error("header_queue", queuedata.data.task.tasks[0]);
    if (queuedata.data.task.tasks.length == 0) {
      if(items.data.task.tasks[0].aggregation[0].value == 0.0){
      this.$field.innerHTML = `
        <div class="value is-zero"> Queued Calls:${items.data.task.tasks[0].aggregation[0].value}</div>
        <div class="value">Total Calls: 0</div>`;
      }else if(items.data.task.tasks[0].aggregation[0].value < 3.0){
        this.$field.innerHTML = `
          <div class="value lt-2"> Queued Calls:${items.data.task.tasks[0].aggregation[0].value}</div>
          <div class="value">Total Calls: 0</div>`;
      }else if(items.data.task.tasks[0].aggregation[0].value > 2.0){
        this.$field.innerHTML = `
          <div class="value gt-2">Queued Calls:${items.data.task.tasks[0].aggregation[0].value}</div>
          <div class="value">Total Calls: 0</div>`;
      }
    }else{
      if(items.data.task.tasks[0].aggregation[0].value == 0.0){
      this.$field.innerHTML = `
        <div class="value is-zero"> Queued Calls:${items.data.task.tasks[0].aggregation[0].value}</div>
        <div class="value">Total Calls:${queuedata.data.task.tasks[0].aggregation[0].value}</div>`;
      }else if(items.data.task.tasks[0].aggregation[0].value < 3.0){
        this.$field.innerHTML = `
          <div class="value lt-2"> Queued Calls:${items.data.task.tasks[0].aggregation[0].value}</div>
          <div class="value">Total Calls:${queuedata.data.task.tasks[0].aggregation[0].value}</div>`;
      }else if(items.data.task.tasks[0].aggregation[0].value > 2.0){
        this.$field.innerHTML = `
          <div class="value gt-2">Queued Calls:${items.data.task.tasks[0].aggregation[0].value}</div>
          <div class="value">Total Calls:${queuedata.data.task.tasks[0].aggregation[0].value}</div>`;
      }
    }
    
    
  }
  //setBusy(b){ this.$spinner.classList.toggle("hidden",!b); }
  async refresh(manual){
    try{
      //this.setBusy(true);
      const data = await this.fetchHistory();
      const queuedata = await this.fetchqueuecalls();
      logger.error("header_queue", data);
      this.render(data,queuedata);
    }catch(err){
      logger.error("header_queue", err?.message || String(err));
      this.$message.textContent = `Fehler: ${err?.message || err}`;
    }finally{ //this.setBusy(false);
       }
  }
}

customElements.define("rss-widget", header_queue);

