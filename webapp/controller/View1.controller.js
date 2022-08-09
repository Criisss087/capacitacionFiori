sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
	"sap/ui/table/Column",
	"sap/m/SearchField",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */

    function (Controller, Filter, FilterOperator, MessageBox, MessageToast, Fragment, Column, SearchField) {
        "use strict";

        return Controller.extend("project1.controller.View1", {
            onInit: function () {
            this.getOrders();

            var oFilter = this.getView().byId("filterBar");
			oFilter.addEventDelegate({
				onAfterRendering: function(oEvent) {
					var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

					var oButton = oEvent.srcControl._oSearchButton;
					oButton.setText(oResourceBundle.getText("goButton"));
				}.bind(this)
			})
            },

            getOrders: function() {
                this.getView().byId('tableOders').setBusy(true);
                this.getOwnerComponent().getModel("northwind").read("/Orders", {
                    urlParameters: {
                        "$expand": "Order_Details"
                      },
                    success: function(resp){
                        this.getOwnerComponent().getModel('mOrders').setData(resp.results);
                      //  this.getOwnerComponent().getModel('mOrders').setProperty("/", resp.results)
                        this.getView().byId('tableOders').setBusy(false)
                        
                    }.bind(this),
                    error: function(err){
                       // MessageBox.error(JSON.parse(err.responseText).error.message.value);
                        MessageToast.show(JSON.parse(err.responseText).error.message.value);
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
                // Modelo
                let orderId = this.getView().getModel("mFilter").getProperty("/OrderID");
                // Id
                let customerId = this.getView().byId("inputFiltro").getValue();
                // Referencia                                                         // CTX //
                let city = this.getView().byId("filterBar").getContent()[1].getContent()[2].getContent()[1].getValue()

                // Range date
                let oRangeDate = this.getView().byId("rangeSelection");
                let from = oRangeDate.getProperty('dateValue');
                let to = oRangeDate.getProperty('secondDateValue');

                let aFilter = [];
                // BT entre fechas
                if(from){
                    aFilter.push(new sap.ui.model.Filter("OrderDate", "BT", from, to));
                }

                // Filter EQ sin importar libreria 
                if(orderId){
                 aFilter.push(new sap.ui.model.Filter("OrderID", "EQ", orderId));
                }
                // OR Sin Importando Libreria
                if(city){
                    aFilter.push(new Filter({
                        filters: [
                          new Filter("ShipCity", FilterOperator.Contains, city),
                          new Filter("ShipCountry", FilterOperator.Contains, city),
                        ],
                        and: false,
                      }));
                   }


                let oTable = this.getView().byId("tableOders");
                oTable.getBinding("items").filter(aFilter)


            },
            onReset: function(oEvent){
                let oTable = this.getView().byId("tableOders");
                oTable.getBinding("items").filter([])
            },

            openDialog: function(oEvent){
          
                    var oButton = oEvent.getSource(),
                        oView = this.getView();
        
                    if (!this._pDialog) {
                        this._pDialog = Fragment.load({
                            id: oView.getId(),
                            name: "project1.view.fragments.Dialog",
                            controller: this
                        }).then(function(oDialog){
                            oView.addDependent(oDialog);
                            return oDialog;
                        });
                    }
        
                    this._pDialog.then(function(oDialog){
                     //   this._configDialog(oButton, oDialog);
                        oDialog.open();
                    }.bind(this));
                
            },
            onHelpValue: function() {
                this._getDialog().then(function(oDialog) {
                    oDialog.open();
                }.bind(this));
            },
            onValueHelpOkPress: function(oEvent) {
                var aTokens = oEvent.getParameter("tokens");
                this.getView().byId('multiInput').setTokens(aTokens);
                this._oDialog.close();
            },

            onSearchHelp: function(oEvent) {
                const sValue = this._oDialog.getFilterBar().getBasicSearchValue();
                let aFilters = [];
                if(sValue){
                aFilters.push(new Filter({
                    filters: [
                        new Filter("OrderID", 'EQ', sValue),
                        new Filter("EmployeeID", 'EQ', sValue)
                    ],
                    and: false
                }));
            }
                this._oDialog.getTableAsync().then(function(oTable) {
                    oTable.getBinding("rows").filter(aFilters);
                })
            },

            clearHelp: function(evt){
                    debugger;
            },

    
            onValueHelpCancelPress: function(oEvent) {
                this._oDialog.close();
            },
            _getDialog: function() {
                const oView = this.getView();
                this._oBasicSearchField = new SearchField();
                if (!this._pDialog) {
                    this._pDialog = Fragment.load({
                        id: oView.getId(),
                        name: "project1.view.fragments.Dialog",
                        controller: this
                    }).then(function(oDialog) {
                        this._oDialog = oDialog;
    
                        let oFilterBar = oDialog.getFilterBar();
                        oDialog.setModel(this.getOwnerComponent().getModel('mOrders'), 'mOrders');
    
                        oFilterBar.setFilterBarExpanded(false);
                        oFilterBar.setBasicSearch(this._oBasicSearchField);
    
                        // Trigger filter bar search when the basic search is fired
                        this._oBasicSearchField.attachSearch(function() {
                            oFilterBar.search();
                        });
                      
                        debugger;
                        oDialog.getTableAsync().then(function(oTable) {
                            oTable.setModel(this.getOwnerComponent().getModel("mOrders"));
    
                            // For Desktop and tabled the default table is sap.ui.table.Table
                            if (oTable.bindRows) {
                                oTable.bindAggregation("rows", {
                                    path: "/",
                                    events: {
                                        dataReceived: function() {
                                            oDialog.update();
                                        }
                                    }
                                });
    
                                oTable.addColumn(new Column({
                                    label: "Order ID",
                                    template: "OrderID"
                                }));
                                oTable.addColumn(new Column({
                                    label: "Emplyee",
                                    template: "EmployeeID"
                                }));
                            }
                        }.bind(this));
                        oView.addDependent(oDialog);
                        return oDialog;
                    }.bind(this));
                }
                return this._pDialog;
            }
        });
    });
