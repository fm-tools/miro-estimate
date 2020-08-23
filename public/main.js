miro.onReady(() => {
    miro.initialize({
      extensionPoints: {
        bottomBar: {
          title: 'Estimates',
          svgIcon: Config.icon,
          onClick: function () {
            miro.board.ui.openLeftSidebar('public/sidebar.html')
          }
        },
        getWidgetMenuItems: (widgets) => {

          const supportedWidgetsInSelection = widgets
              .filter((widget) => Config.supported_widgets[widget.type.toLowerCase()] !== undefined);

          // All selected widgets have to be supported in order to show the menu
          if (supportedWidgetsInSelection.length == widgets.length) {
              return Promise.resolve([{
                  tooltip: 'Estimate',
                  svgIcon: Config.icon,
                  onClick: async (widgets) => {
                    await miro.board.ui.openModal('public/modal.html', Config.modal_options)
                  }
              }])
          }

          // Not all selected widgets are supported, we won't show the menu
          return Promise.resolve([{}]);
      }
      }
    })
  })
  