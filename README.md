# Deploy a package to IIS via Web Deploy

This action allows you to deploy a web deploy package or a folder to an IIS website with web deploy.

## Example:

With a self-hosted runner running on the Windows server:

```yml
    steps:
    - uses: cschleiden/webdeploy-action@v1
      with:
        webSiteName: 'My IIS Site'
        package: ${{ format('{0}\dist', runner.workspace) }}
```

## Acknowledgments

This is a partial port of an Azure Pipelines [task](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/deploy/iis-web-app-deployment-on-machine-group?view=azure-devops), not all options were ported, and the code wasn't cleaned up a lot. 
