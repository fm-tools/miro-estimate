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
              return {
                  tooltip: 'Estimate',
                  svgIcon: Config.icon,
                  onClick: (widgets) => {
                    miro.board.ui.openBottomPanel('public/bottompanel.html', Config.bottompanel_options)
                  }
              }
          }

          // Not all selected widgets are supported, we won't show the menu
          return {};
      }
      }
    })
  })
  