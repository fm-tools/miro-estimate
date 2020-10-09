miro.onReady(() => {
  miro.initialize({
    extensionPoints: {
      bottomBar: {
        title: 'Estimates',
        svgIcon: Config.icon,
        onClick: function () {
          miro.board.ui.openLeftSidebar('public/sidebar.html')
        }
      }
    }
  })

  miro.addListener('SELECTION_UPDATED', async function (event) {
    let widgets = await miro.board.selection.get();

    if (widgets.length > 0) {
      const supportedWidgetsInSelection = widgets
      .filter((widget) => Config.supported_widgets[widget.type.toLowerCase()] !== undefined);

      // All selected widgets have to be supported in order to show the menu
      if (supportedWidgetsInSelection.length == widgets.length) {
        miro.board.ui.openBottomPanel('public/bottompanel.html', Config.bottompanel_options);
      }

    } else {
        await miro.board.ui.closeBottomPanel();
    }
});
})
