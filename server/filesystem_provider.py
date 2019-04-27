import os
from functools import reduce

def get_directory_structure(rootdir):
    """
    Creates a nested dictionary that represents the folder structure of rootdir
    """

    afiles = []
    rootdir = rootdir.rstrip(os.sep)
    start = rootdir.rfind(os.sep) + 1

    for path, dirs, files in os.walk(rootdir):

        for f in files:
            afiles.append({'name':f,'path':path+'/'+f})


    return afiles


class FileSystemProvider:
    def __init__(self):
        pass

    def get_files_dict(self):
        return get_directory_structure('./devroot')


# print(get_directory_structure('./devroot'))
# print("d")
