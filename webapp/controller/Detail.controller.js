sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History) {
        "use strict";

        return Controller.extend("project1.controller.Detail", {
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.attachRouteMatched(this.onRouteMatched, this);
            },
            
            onRouteMatched: function (oEvent) {
                let sRouteName = oEvent.getParameter("name"),
                    orderId = oEvent.getParameter("arguments").orderId;

                let oData = this.getOwnerComponent().getModel('mOrders').getData();
                if(oData.length > 0 ){
                for(let item of oData) {
                    if(item.OrderID === Number(orderId)){
                        var data = item;
                    }
                }
                this.getOwnerComponent().getModel('mOrders').setProperty("/Detail", data);
                }else {
                    this.getOrder(orderId)
                }
              
            },


            getOrder: function(orderId) {
                let oModel = this.getOwnerComponent().getModel("northwind");
                this.getView().byId("SimpleFormChange354").setBusy(true)

                oModel.read(`/Orders(${Number(orderId)})`, {
                    urlParameters: {
                        "$expand": "Order_Details"
                      },
                    success: function(resp){
                        this.getOwnerComponent().getModel('mOrders').setProperty("/Detail", resp);
                        this.getView().byId("SimpleFormChange354").setBusy(false);
                    }.bind(this),
                    error: function(err){
                        debugger;
                    }
                })
            },

            onNavBack: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();
    
                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("RouteView1", {}, true);
                }
            }
        });
    });
