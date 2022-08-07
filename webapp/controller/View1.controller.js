sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("project1.controller.View1", {
            onInit: function () {
                        this.getOrders();
            },

            getOrders: function() {
                this.getView().byId('tableOders').setBusy(true);
                this.getOwnerComponent().getModel("northwind").read("/Orders", {
                    urlParameters: {
                        "$expand": "Order_Details"
                      },
                    success: function(resp){
                        this.getOwnerComponent().getModel('mOrders').setData(resp.results);
                        this.getView().byId('tableOders').setBusy(false)
                    }.bind(this),
                    error: function(err){
                        debugger;
                    }
                })
            },

            onNavDetail: function(oEvent) {
                let oSelected = oEvent.getSource().getBindingContext("mOrders").getObject();
                let oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo('Detail', {
                    orderId: oSelected.OrderID,
                    employeeId: oSelected.EmployeeID
                });
            },

            onSearch: function(oEvent){
                debugger;
            }
        });
    });
